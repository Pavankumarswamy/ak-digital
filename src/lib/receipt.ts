export function generateAndDownloadReceipt({
  trackingId,
  serviceName,
  amount,
  customerName,
  date,
}: {
  trackingId: string;
  serviceName: string;
  amount: number;
  customerName: string;
  date: string;
}) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Set canvas dimensions
  canvas.width = 600;
  canvas.height = 800;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header / Logo Area
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, 140);

  ctx.fillStyle = "#00d2ff"; // Neon blue/cyan accent
  ctx.fillRect(0, 135, canvas.width, 5);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("AK DIGITAL HUB", canvas.width / 2, 70);
  
  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#a1a1aa";
  ctx.fillText("Payment Receipt", canvas.width / 2, 105);

  // Body Content
  ctx.textAlign = "left";
  ctx.fillStyle = "#171717";
  
  let y = 200;
  
  // Title
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("Order Successful", 50, y);
  
  y += 40;
  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#52525b";
  ctx.fillText("Thank you for your order! Here are your submission details:", 50, y);
  
  y += 60;
  
  // Details Box
  ctx.strokeStyle = "#e4e4e7";
  ctx.lineWidth = 2;
  ctx.strokeRect(50, y, 500, 300);
  ctx.fillStyle = "#fafafa";
  ctx.fillRect(51, y + 1, 498, 298);

  const drawRow = (label: string, value: string, rowY: number) => {
    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#3f3f46";
    ctx.fillText(label, 70, rowY);
    
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#09090b";
    ctx.textAlign = "right";
    ctx.fillText(value, 530, rowY);
    ctx.textAlign = "left";
    
    ctx.beginPath();
    ctx.moveTo(70, rowY + 15);
    ctx.lineTo(530, rowY + 15);
    ctx.strokeStyle = "#e4e4e7";
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  let rowY = y + 50;
  drawRow("Tracking ID:", trackingId, rowY);
  
  rowY += 50;
  drawRow("Customer Name:", customerName || "N/A", rowY);
  
  rowY += 50;
  drawRow("Service:", serviceName, rowY);
  
  rowY += 50;
  drawRow("Date:", date, rowY);
  
  rowY += 50;
  drawRow("Amount Paid:", `Rs. ${amount.toFixed(2)}`, rowY);

  // Footer
  y += 360;
  ctx.font = "italic 14px sans-serif";
  ctx.fillStyle = "#71717a";
  ctx.textAlign = "center";
  ctx.fillText("Please keep this receipt for your records.", canvas.width / 2, y);
  ctx.fillText("For any queries, contact our support via WhatsApp.", canvas.width / 2, y + 25);

  // Download logic
  try {
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `Receipt_${trackingId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to generate receipt image", error);
  }
}
