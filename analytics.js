/* ============================================================
   TELEMETRY & NATIVE GRAPHIC DRAWING (js/analytics.js)
   ============================================================ */

window.analytics = {
    getStats: async () => {
        const telemetry = await window.db.getTelemetry();
        const students = await window.db.getStudents();
        
        const matchRate = telemetry.totalQueries > 0 
            ? Math.round((telemetry.successfulMatches / telemetry.totalQueries) * 100)
            : 85;
            
        return {
            totalQueries: telemetry.totalQueries,
            matchRate: `${matchRate}%`,
            activeStudents: students.length,
            voiceRequests: telemetry.voiceRequestsCount
        };
    },
    
    // Draw vector Line Chart
    drawLineChart: (canvasId, theme = "dark") => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        const w = rect.width;
        const h = rect.height;
        ctx.clearRect(0, 0, w, h);
        
        const data = [12, 19, 15, 28, 22, 35];
        const labels = ["9 AM", "11 AM", "1 PM", "3 PM", "5 PM", "7 PM"];
        
        const colorAccent = theme === "dark" ? "#8b5cf6" : "#6a0dad";
        const colorGrid = theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
        const colorText = theme === "dark" ? "#9ca3af" : "#6b7280";
        
        const padding = 30;
        const chartW = w - padding * 2;
        const chartH = h - padding * 2;
        
        ctx.strokeStyle = colorGrid;
        ctx.lineWidth = 1;
        ctx.fillStyle = colorText;
        ctx.font = "9px Poppins";
        ctx.textAlign = "center";
        
        for (let i = 0; i <= 3; i++) {
            const y = padding + (chartH / 3) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(w - padding, y);
            ctx.stroke();
        }
        
        const stepX = chartW / (data.length - 1);
        const maxVal = 40;
        
        const points = data.map((val, i) => {
            const x = padding + i * stepX;
            const y = padding + chartH - (val / maxVal) * chartH;
            return { x, y };
        });
        
        const fillGrad = ctx.createLinearGradient(0, padding, 0, h - padding);
        fillGrad.addColorStop(0, theme === "dark" ? "rgba(139, 92, 246, 0.3)" : "rgba(106, 13, 173, 0.25)");
        fillGrad.addColorStop(1, "rgba(106, 13, 173, 0)");
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, h - padding);
        
        ctx.lineTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i+1].x) / 2;
            const yc = (points[i].y + points[i+1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.lineTo(points[points.length - 1].x, h - padding);
        ctx.closePath();
        ctx.fillStyle = fillGrad;
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i+1].x) / 2;
            const yc = (points[i].y + points[i+1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.strokeStyle = colorAccent;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        
        points.forEach((pt, i) => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = colorAccent;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            
            ctx.fillStyle = colorText;
            ctx.fillText(labels[i], pt.x, h - 8);
        });
    },
    
    // Draw Donut chart
    drawDonutChart: (canvasId, theme = "dark") => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        const w = rect.width;
        const h = rect.height;
        ctx.clearRect(0, 0, w, h);
        
        const data = [30, 25, 20, 15, 10];
        const colors = ["#0044ff", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
        const labels = ["Fees", "Hostel", "Admissions", "Placements", "General"];
        
        const centerX = w * 0.35;
        const centerY = h * 0.5;
        const outerRadius = Math.min(centerX, centerY) * 0.75;
        const innerRadius = outerRadius * 0.55;
        
        let startAngle = -Math.PI / 2;
        
        data.forEach((val, i) => {
            const sliceAngle = (val / 100) * (Math.PI * 2);
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
            ctx.closePath();
            
            ctx.fillStyle = colors[i];
            ctx.fill();
            
            ctx.strokeStyle = theme === "dark" ? "#141426" : "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            startAngle += sliceAngle;
        });
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius - 1, 0, Math.PI * 2);
        ctx.fillStyle = theme === "dark" ? "#141426" : "#ffffff";
        ctx.fill();
        
        const legendX = w * 0.65;
        const legendYStart = centerY - (data.length * 15) / 2;
        ctx.font = "9px Poppins";
        ctx.textAlign = "left";
        
        data.forEach((val, i) => {
            const y = legendYStart + i * 16;
            
            ctx.beginPath();
            ctx.rect(legendX, y - 6, 8, 8);
            ctx.fillStyle = colors[i];
            ctx.fill();
            
            ctx.fillStyle = theme === "dark" ? "#f3f4f6" : "#1a1a3a";
            ctx.fillText(`${labels[i]}: ${val}%`, legendX + 14, y + 1);
        });
    }
};

