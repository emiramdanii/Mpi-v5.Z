// ═══════════════════════════════════════════════════════════════
// HUBUNGAN-KONSEP — Concept map / relationship diagram
// Center node + surrounding nodes + SVG connections + popup
// ═══════════════════════════════════════════════════════════════

import type { HubunganKonsepSlots } from '../engine/slot-types';

export function generateHubunganKonsepContent(data: HubunganKonsepSlots): string {
  // ── Local HTML entity escaper ──
  function esc(str: string | number | null | undefined): string {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const nodeCount = data.nodes.length;
  const nodesDataJS = JSON.stringify(data.nodes.map(n => ({
    label: n.label,
    icon: n.icon,
    color: n.color,
    deskripsi: n.deskripsi,
  })));
  const connectionsDataJS = JSON.stringify(data.connections);

  // Compute node positions: evenly distributed in a circle around center
  const positionsJS = JSON.stringify(
    data.nodes.map((_, i) => {
      const angle = (2 * Math.PI * i / nodeCount) - Math.PI / 2;
      // Use percentage-based positioning for responsiveness
      const radiusPct = 36; // % from center
      return {
        x: 50 + radiusPct * Math.cos(angle),
        y: 50 + radiusPct * Math.sin(angle),
      };
    })
  );

  // Generate SVG connection lines
  const connectionLinesHTML = data.connections.map((conn, idx) => {
    // from: center(-1) or node index, to: node index
    // We'll render them with JS since positions are dynamic
    return '';
  }).join('');

  // Pre-render node elements
  const nodeElementsHTML = data.nodes.map((node, idx) => `
    <div class="hk-node fadein" data-node-idx="${idx}"
      onclick="showNodeDetail(${idx})"
      style="animation-delay:${idx * 0.08}s;cursor:pointer"
      role="button" tabindex="0" aria-label="Lihat detail: ${esc(node.label)}">
      <div class="hk-node-dot" style="background:${esc(node.color)}22;border:2px solid ${esc(node.color)}">
        <span style="font-size:1.1rem">${esc(node.icon)}</span>
      </div>
      <div class="hk-node-label" style="color:${esc(node.color)}">${esc(node.label)}</div>
    </div>
  `).join('\n');

  return `
<style>
  .hk-container{position:relative;width:100%;max-width:700px;margin:0 auto;aspect-ratio:1/1;min-height:400px;}
  .hk-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10;text-align:center;cursor:default;}
  .hk-center-ring{width:90px;height:90px;border-radius:50%;background:var(--y)18;border:3px solid var(--y);display:flex;align-items:center;justify-content:center;margin:0 auto 6px;box-shadow:0 0 25px rgba(249,193,46,.2);animation:glow 3s ease-in-out infinite;}
  .hk-center-icon{font-size:2rem;}
  .hk-center-label{font-family:'Fredoka One',cursive;font-size:.95rem;color:var(--y);max-width:120px;word-wrap:break-word;}
  .hk-node{position:absolute;transform:translate(-50%,-50%);z-index:5;text-align:center;transition:all .25s;max-width:100px;}
  .hk-node:hover{z-index:15;transform:translate(-50%,-50%) scale(1.12);}
  .hk-node-dot{width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 4px;transition:all .25s;box-shadow:0 2px 10px rgba(0,0,0,.2);}
  .hk-node:hover .hk-node-dot{box-shadow:0 4px 20px rgba(0,0,0,.35);}
  .hk-node-label{font-size:.72rem;font-weight:800;line-height:1.3;word-wrap:break-word;}
  .hk-svg{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;}
  .hk-line{stroke-width:2;fill:none;opacity:.5;transition:opacity .3s;}
  .hk-line-label{font-size:.62rem;font-weight:800;fill:var(--muted);text-anchor:middle;dominant-baseline:central;}
  .hk-detail-overlay{position:fixed;inset:0;background:rgba(10,20,35,.88);display:none;align-items:center;justify-content:center;z-index:500;animation:fadeIn .3s ease;}
  .hk-detail-overlay.show{display:flex;}
  .hk-detail-card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:28px 24px;max-width:420px;width:90%;animation:bounceIn .5s ease both;position:relative;text-align:center;}
  .hk-detail-icon{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:1.8rem;box-shadow:0 4px 16px rgba(0,0,0,.2);}
  .hk-detail-title{font-family:'Fredoka One',cursive;font-size:1.15rem;margin-bottom:8px;}
  .hk-detail-desc{font-size:.9rem;line-height:1.7;color:var(--text);margin-bottom:14px;}
  .hk-detail-close{position:absolute;top:12px;right:14px;background:none;border:none;color:var(--muted);cursor:pointer;font-size:1.1rem;padding:4px;transition:color .2s;}
  .hk-detail-close:hover{color:var(--text);}
  .hk-legend{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:10px;}
  .hk-legend-item{display:flex;align-items:center;gap:5px;font-size:.72rem;font-weight:700;color:var(--muted);}
  .hk-legend-dot{width:10px;height:10px;border-radius:50%;}
  @media(max-width:640px){
    .hk-container{min-height:340px;}
    .hk-center-ring{width:70px;height:70px;}
    .hk-center-icon{font-size:1.5rem;}
    .hk-center-label{font-size:.82rem;}
    .hk-node-dot{width:40px;height:40px;}
    .hk-node-label{font-size:.64rem;}
    .hk-detail-card{padding:20px 16px;}
  }
  @media(max-width:380px){
    .hk-container{min-height:300px;}
    .hk-center-ring{width:60px;height:60px;}
    .hk-node-dot{width:34px;height:34px;}
  }
</style>

<div class="fadein" style="text-align:center;margin-bottom:14px">
  <div style="font-size:2rem;margin-bottom:4px">🔗</div>
  <h2 class="h2">${esc(data.judul)}</h2>
  <p class="sub mt8">Klik node untuk melihat detail konsep</p>
</div>

<div class="hk-container fadein" id="hkContainer">
  <svg class="hk-svg" id="hkSvg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
    <!-- Connection lines will be drawn by JS -->
  </svg>

  <div class="hk-center">
    <div class="hk-center-ring">
      <span class="hk-center-icon">${esc(data.centerIcon)}</span>
    </div>
    <div class="hk-center-label">${esc(data.centerLabel)}</div>
  </div>

  ${nodeElementsHTML}
</div>

<div class="hk-legend fadein">
  ${data.nodes.map(n => `<div class="hk-legend-item"><span class="hk-legend-dot" style="background:${esc(n.color)}"></span>${esc(n.label)}</div>`).join('')}
</div>

<div class="hk-detail-overlay" id="hkDetailOverlay">
  <div class="hk-detail-card">
    <button class="hk-detail-close" onclick="closeNodeDetail()" title="Tutup">✕</button>
    <div class="hk-detail-icon" id="hkDetailIcon"></div>
    <div class="hk-detail-title" id="hkDetailTitle"></div>
    <div class="hk-detail-desc" id="hkDetailDesc"></div>
    <button class="btn btn-ghost btn-sm" onclick="closeNodeDetail()">Tutup</button>
  </div>
</div>

<script>
(function(){
  var nodes = ${nodesDataJS};
  var connections = ${connectionsDataJS};
  var positions = ${positionsJS};
  var container = document.getElementById('hkContainer');
  var svg = document.getElementById('hkSvg');

  // Position nodes absolutely
  var nodeEls = container.querySelectorAll('.hk-node');
  nodeEls.forEach(function(el, idx){
    if(positions[idx]){
      el.style.left = positions[idx].x + '%';
      el.style.top = positions[idx].y + '%';
    }
  });

  // Draw connection lines in SVG
  function drawConnections(){
    if(!svg) return;
    svg.innerHTML = '';

    // Defs for markers
    var defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
    svg.appendChild(defs);

    connections.forEach(function(conn){
      var fromX, fromY, toX, toY;

      if(conn.from === -1){
        // From center
        fromX = 50; fromY = 50;
      } else {
        fromX = positions[conn.from] ? positions[conn.from].x : 50;
        fromY = positions[conn.from] ? positions[conn.from].y : 50;
      }

      toX = positions[conn.to] ? positions[conn.to].x : 50;
      toY = positions[conn.to] ? positions[conn.to].y : 50;

      var fromColor = conn.from === -1 ? 'var(--y)' : (nodes[conn.from] ? nodes[conn.from].color : 'var(--muted)');
      var toColor = nodes[conn.to] ? nodes[conn.to].color : 'var(--muted)';

      // Gradient
      var gradId = 'grad' + conn.from + '-' + conn.to;
      var grad = document.createElementNS('http://www.w3.org/2000/svg','linearGradient');
      grad.setAttribute('id', gradId);
      grad.setAttribute('gradientUnits','userSpaceOnUse');
      grad.setAttribute('x1', fromX); grad.setAttribute('y1', fromY);
      grad.setAttribute('x2', toX); grad.setAttribute('y2', toY);
      var stop1 = document.createElementNS('http://www.w3.org/2000/svg','stop');
      stop1.setAttribute('offset','0%'); stop1.setAttribute('stop-color', fromColor);
      var stop2 = document.createElementNS('http://www.w3.org/2000/svg','stop');
      stop2.setAttribute('offset','100%'); stop2.setAttribute('stop-color', toColor);
      grad.appendChild(stop1); grad.appendChild(stop2);
      defs.appendChild(grad);

      // Line
      var line = document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1', fromX);
      line.setAttribute('y1', fromY);
      line.setAttribute('x2', toX);
      line.setAttribute('y2', toY);
      line.setAttribute('stroke', 'url(#' + gradId + ')');
      line.setAttribute('class','hk-line');
      svg.appendChild(line);

      // Connection label at midpoint
      if(conn.label){
        var midX = (fromX + toX) / 2;
        var midY = (fromY + toY) / 2;
        // Offset label slightly perpendicular to the line
        var dx = toX - fromX;
        var dy = toY - fromY;
        var len = Math.sqrt(dx*dx + dy*dy) || 1;
        var offX = (-dy / len) * 3;
        var offY = (dx / len) * 3;

        var labelBg = document.createElementNS('http://www.w3.org/2000/svg','rect');
        var labelText = document.createElementNS('http://www.w3.org/2000/svg','text');
        labelText.setAttribute('x', midX + offX);
        labelText.setAttribute('y', midY + offY);
        labelText.setAttribute('class','hk-line-label');
        labelText.textContent = conn.label;

        // Background rect behind text
        var textLen = conn.label.length * 1.2;
        labelBg.setAttribute('x', midX + offX - textLen / 2);
        labelBg.setAttribute('y', midY + offY - 4);
        labelBg.setAttribute('width', textLen);
        labelBg.setAttribute('height', 8);
        labelBg.setAttribute('rx', 3);
        labelBg.setAttribute('fill','var(--bg)');
        labelBg.setAttribute('opacity','0.8');

        svg.appendChild(labelBg);
        svg.appendChild(labelText);
      }
    });
  }

  drawConnections();
  // Redraw on resize for responsive adjustments
  window.addEventListener('resize', drawConnections);

  window.showNodeDetail = function(idx){
    var node = nodes[idx];
    if(!node) return;
    var overlay = document.getElementById('hkDetailOverlay');
    var icon = document.getElementById('hkDetailIcon');
    var title = document.getElementById('hkDetailTitle');
    var desc = document.getElementById('hkDetailDesc');

    if(icon){
      icon.style.background = node.color + '22';
      icon.style.border = '2px solid ' + node.color;
      icon.innerHTML = node.icon;
    }
    if(title){
      title.textContent = node.label;
      title.style.color = node.color;
    }
    if(desc) desc.textContent = node.deskripsi;
    if(overlay) overlay.classList.add('show');
    if(typeof SFX !== 'undefined' && SFX.popup) SFX.popup();
  };

  window.closeNodeDetail = function(){
    var overlay = document.getElementById('hkDetailOverlay');
    if(overlay) overlay.classList.remove('show');
  };
})();
</script>
`;
}
