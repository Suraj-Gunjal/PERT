"use client";

import { useEffect, useRef } from "react";

export default function GraphDisplay({ results, activities }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, width, height);

    // Calculate node positions
    const activityMap = {};
    const padding = 60;
    const nodeRadius = 30;

    activities.forEach((a) => {
      const resultActivity = results.activities.find((r) => r.id === a.id);
      if (resultActivity) {
        const maxDuration = Math.max(...results.activities.map((x) => x.ef));
        const x =
          padding + (resultActivity.es / maxDuration) * (width - 2 * padding);
        const y = 50 + Math.random() * (height - 100);
        activityMap[a.id] = { x, y, ...resultActivity };
      }
    });

    // Draw edges
    activities.forEach((activity) => {
      if (activity.predecessors && activity.predecessors.length > 0) {
        activity.predecessors.forEach((pred) => {
          const fromNode = activityMap[pred];
          const toNode = activityMap[activity.id];
          if (fromNode && toNode) {
            const isCritical =
              results.criticalPath.includes(pred) &&
              results.criticalPath.includes(activity.id);

            ctx.strokeStyle = isCritical ? "#dc3545" : "#bbb";
            ctx.lineWidth = isCritical ? 3 : 2;
            ctx.setLineDash(isCritical ? [] : [5, 5]);
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Arrow
            const angle = Math.atan2(
              toNode.y - fromNode.y,
              toNode.x - fromNode.x
            );
            ctx.fillStyle = isCritical ? "#dc3545" : "#bbb";
            ctx.beginPath();
            ctx.moveTo(toNode.x, toNode.y);
            ctx.lineTo(
              toNode.x - 12 * Math.cos(angle - Math.PI / 6),
              toNode.y - 12 * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
              toNode.x - 12 * Math.cos(angle + Math.PI / 6),
              toNode.y - 12 * Math.sin(angle + Math.PI / 6)
            );
            ctx.fill();
          }
        });
      }
    });

    // Draw nodes
    Object.values(activityMap).forEach((node) => {
      const gradient = ctx.createRadialGradient(
        node.x - 10,
        node.y - 10,
        0,
        node.x,
        node.y,
        nodeRadius
      );
      if (node.critical) {
        gradient.addColorStop(0, "#ff6b6b");
        gradient.addColorStop(1, "#dc3545");
      } else {
        gradient.addColorStop(0, "#8b9dff");
        gradient.addColorStop(1, "#667eea");
      }
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Node ID
      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.id, node.x, node.y - 5);

      // Duration
      ctx.fillStyle = "#fff";
      ctx.font = "11px Arial";
      ctx.fillText(`${node.duration.toFixed(1)}d`, node.x, node.y + 8);

      // Labels below
      ctx.fillStyle = "#333";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`ES:${node.es.toFixed(0)}`, node.x, node.y + 50);
      ctx.fillText(`EF:${node.ef.toFixed(0)}`, node.x, node.y + 62);
    });

    // Legend
    ctx.font = "12px Arial";
    ctx.fillStyle = "#666";
    ctx.textAlign = "left";
    ctx.fillText("🔴 Red = Critical Path", 20, height - 10);
    ctx.fillText("🔵 Blue = Non-critical", 200, height - 10);
  }, [results, activities]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={900}
        height={450}
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          background: "#fafafa",
          width: "100%",
          maxWidth: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
