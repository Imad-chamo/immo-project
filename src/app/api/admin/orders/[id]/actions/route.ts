import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyInspectorAssigned, notifyReportDelivered } from "@/lib/notifications";
import { generateInspectionPDF } from "@/lib/pdf-generator";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { action } = body;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      client: true,
      inspector: { include: { inspectorProfile: true } },
      report: true,
    },
  });

  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  switch (action) {
    case "confirm_payment": {
      await prisma.order.update({
        where: { id },
        data: {
          paymentStatus: "CONFIRMED",
          paymentConfirmedByAdmin: true,
        },
      });
      return NextResponse.json({ message: "Paiement confirmé" });
    }

    case "reject_payment": {
      await prisma.order.update({
        where: { id },
        data: {
          paymentStatus: "FAILED",
          status: "CANCELLED",
        },
      });
      return NextResponse.json({ message: "Paiement rejeté, commande annulée" });
    }

    case "assign_inspector": {
      const { inspectorId } = body;
      if (!inspectorId) return NextResponse.json({ error: "Inspector ID requis" }, { status: 400 });

      await prisma.order.update({
        where: { id },
        data: { inspectorId, status: "ASSIGNED" },
      });

      await notifyInspectorAssigned(id);
      return NextResponse.json({ message: "Inspecteur assigné" });
    }

    case "approve_report": {
      if (!order.report) return NextResponse.json({ error: "Rapport introuvable" }, { status: 404 });

      await prisma.report.update({
        where: { id: order.report.id },
        data: {
          status: "APPROVED",
          adminNotes: body.adminNotes,
          approvedAt: new Date(),
        },
      });

      await prisma.order.update({ where: { id }, data: { status: "QUALITY_CHECK" } });

      return NextResponse.json({ message: "Rapport approuvé — prêt pour livraison" });
    }

    case "reject_report": {
      if (!order.report) return NextResponse.json({ error: "Rapport introuvable" }, { status: 404 });

      await prisma.report.update({
        where: { id: order.report.id },
        data: {
          status: "DRAFT",
          adminNotes: body.adminNotes,
        },
      });

      await prisma.order.update({ where: { id }, data: { status: "IN_PROGRESS" } });

      return NextResponse.json({ message: "Rapport renvoyé à l'inspecteur" });
    }

    case "generate_and_deliver": {
      if (!order.report) return NextResponse.json({ error: "Rapport introuvable" }, { status: 404 });

      try {
        // Generate PDF
        const pdfBuffer = await generateInspectionPDF({
          order: {
            id: order.id,
            formula: order.formula,
            propertyAddress: order.propertyAddress,
            propertyCity: order.propertyCity,
            propertyType: order.propertyType,
            surfaceArea: order.surfaceArea,
            createdAt: order.createdAt,
          },
          client: { name: order.client.name || "" },
          inspector: {
            name: order.inspector?.name || "",
            badge: order.inspector?.inspectorProfile?.badge || "STARTER",
          },
          report: {
            checklistData: order.report.checklistData as Record<string, unknown>,
            photos: order.report.photos,
            inspectorNotes: order.report.inspectorNotes,
            estimatedRepairMin: order.report.estimatedRepairMin,
            estimatedRepairMax: order.report.estimatedRepairMax,
            estimatedMarketValue: order.report.estimatedMarketValue,
            recommendation: order.report.recommendation,
          },
        });

        // Upload PDF to Cloudinary
        const pdfUrl = await uploadToCloudinary(pdfBuffer, "reports", {
          resource_type: "raw",
          format: "pdf",
        });

        // Update report and order
        await prisma.report.update({
          where: { id: order.report.id },
          data: { status: "DELIVERED", pdfUrl },
        });

        await prisma.order.update({
          where: { id },
          data: {
            status: "DELIVERED",
            deliveredAt: new Date(),
          },
        });

        // Update inspector total missions
        if (order.inspectorId && order.inspector?.inspectorProfile) {
          await prisma.inspectorProfile.update({
            where: { userId: order.inspectorId },
            data: { totalMissions: { increment: 1 } },
          });
        }

        // Notify client
        await notifyReportDelivered(id);

        return NextResponse.json({ message: "Rapport généré et livré au client !" });
      } catch (error) {
        console.error("PDF generation error:", error);
        return NextResponse.json({ error: "Erreur lors de la génération du PDF" }, { status: 500 });
      }
    }

    case "change_status": {
      const { status } = body;
      await prisma.order.update({ where: { id }, data: { status } });
      return NextResponse.json({ message: `Statut changé en ${status}` });
    }

    default:
      return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  }
}
