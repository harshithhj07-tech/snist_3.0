import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { RoadmapData } from "../types";
import { Calendar, Clock, Layers, Filter, CheckCircle2, AlertCircle, RefreshCw, Info } from "lucide-react";

interface GanttChartD3Props {
  roadmap: RoadmapData;
  projectStartDate?: string;
  isLightTheme?: boolean;
  onStepClick?: (stepId: string) => void;
}

interface GanttTask {
  id: string;
  phaseIndex: number;
  phaseName: string;
  stepTitle: string;
  dept: string;
  purpose: string;
  mandatory: boolean;
  completed: boolean;
  startDate: Date;
  endDate: Date;
  durationDays: number;
  dependencies: string[];
}

const parseDurationToDays = (timelineStr: string): number => {
  if (!timelineStr) return 2;
  const cleaned = timelineStr.toLowerCase().trim();
  if (cleaned.includes("instant") || cleaned.includes("immediate")) return 1;
  if (cleaned.includes("hour")) return 1;
  
  const match = cleaned.match(/(\d+)\s*(?:-\s*(\d+))?\s*(day|week|month)/);
  if (match) {
    const num1 = parseFloat(match[1]);
    const num2 = match[2] ? parseFloat(match[2]) : null;
    const unit = match[3];
    let days = num2 ? (num1 + num2) / 2 : num1;
    if (unit.startsWith("week")) days *= 7;
    else if (unit.startsWith("month")) days *= 30;
    return Math.max(1, Math.round(days));
  }
  if (cleaned.includes("1-2 days")) return 2;
  if (cleaned.includes("3-5 days")) return 4;
  if (cleaned.includes("7 days") || cleaned.includes("1 week")) return 7;
  if (cleaned.includes("14 days") || cleaned.includes("2 weeks")) return 14;
  if (cleaned.includes("30 days") || cleaned.includes("1 month")) return 30;
  return 3;
};

export const GanttChartD3: React.FC<GanttChartD3Props> = ({
  roadmap,
  projectStartDate = new Date().toISOString().split("T")[0],
  isLightTheme = false,
  onStepClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>("ALL");
  const [showDependencies, setShowDependencies] = useState<boolean>(true);
  const [hoveredTask, setHoveredTask] = useState<GanttTask | null>(null);

  // Parse roadmap phases & steps into chronological Gantt task records
  const prepareGanttTasks = (): GanttTask[] => {
    if (!roadmap || !roadmap.phases || roadmap.phases.length === 0) return [];

    const tasks: GanttTask[] = [];
    const baseDate = new Date(projectStartDate || Date.now());
    if (isNaN(baseDate.getTime())) {
      baseDate.setTime(Date.now());
    }

    let cumulativeOffsetDays = 0;

    roadmap.phases.forEach((phase, pIdx) => {
      let phaseStartOffset = cumulativeOffsetDays;
      let maxPhaseDuration = 0;

      phase.steps.forEach((step) => {
        const duration = parseDurationToDays(step.timeline);
        
        // Calculate task start and end dates
        const startDate = new Date(baseDate);
        startDate.setDate(baseDate.getDate() + phaseStartOffset);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + duration);

        tasks.push({
          id: step.id,
          phaseIndex: pIdx,
          phaseName: phase.phaseName,
          stepTitle: step.title,
          dept: step.dept,
          purpose: step.purpose,
          mandatory: !!step.mandatory,
          completed: !!step.completed,
          startDate,
          endDate,
          durationDays: duration,
          dependencies: step.dependencies || [],
        });

        if (duration > maxPhaseDuration) {
          maxPhaseDuration = duration;
        }
      });

      // Advance timeline offset for next sequential phase
      cumulativeOffsetDays += Math.max(maxPhaseDuration, 3);
    });

    return tasks;
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const allTasks = prepareGanttTasks();
    const tasks = selectedPhaseFilter === "ALL"
      ? allTasks
      : allTasks.filter(t => t.phaseName === selectedPhaseFilter);

    if (tasks.length === 0) {
      d3.select(svgRef.current).selectAll("*").remove();
      return;
    }

    // Measure dimensions
    const containerWidth = containerRef.current.clientWidth || 800;
    const margin = { top: 50, right: 40, bottom: 40, left: 220 };
    const rowHeight = 44;
    const height = margin.top + margin.bottom + tasks.length * rowHeight;
    const width = Math.max(containerWidth, 650);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    // X Scale: Date scale
    const minDate = d3.min(tasks, (d) => d.startDate) || new Date();
    const maxDate = d3.max(tasks, (d) => d.endDate) || new Date();
    
    // Add 2 padding days on ends
    const chartMinDate = d3.timeDay.offset(minDate, -1);
    const chartMaxDate = d3.timeDay.offset(maxDate, 3);

    const xScale = d3
      .scaleTime()
      .domain([chartMinDate, chartMaxDate])
      .range([margin.left, width - margin.right]);

    // Y Scale: Band scale for task IDs
    const yScale = d3
      .scaleBand()
      .domain(tasks.map((t) => t.id))
      .range([margin.top, height - margin.bottom])
      .padding(0.35);

    // Background Grid Lines
    const gridGroup = svg.append("g").attr("class", "grid-lines");
    const xTicks = xScale.ticks(d3.timeDay.every(Math.max(1, Math.floor(d3.timeDay.count(chartMinDate, chartMaxDate) / 10))));

    xTicks.forEach((tickDate) => {
      const xPos = xScale(tickDate);
      gridGroup
        .append("line")
        .attr("x1", xPos)
        .attr("x2", xPos)
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", isLightTheme ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)")
        .attr("stroke-dasharray", "3 3");
    });

    // Time Axis (X-Axis)
    const xAxis = d3
      .axisTop(xScale)
      .ticks(Math.min(12, d3.timeDay.count(chartMinDate, chartMaxDate)))
      .tickFormat(d3.timeFormat("%b %d") as any);

    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0, ${margin.top})`)
      .call(xAxis as any);

    xAxisGroup.selectAll("text")
      .style("fill", isLightTheme ? "#475569" : "#94a3b8")
      .style("font-size", "10px")
      .style("font-family", "monospace")
      .style("font-weight", "bold");

    xAxisGroup.selectAll("path, line")
      .attr("stroke", isLightTheme ? "#cbd5e1" : "rgba(255,255,255,0.15)");

    // Y-Axis Labels (Phase + Step Titles)
    const yAxisGroup = svg.append("g").attr("class", "y-axis");

    tasks.forEach((t) => {
      const yPos = (yScale(t.id) || 0) + yScale.bandwidth() / 2;

      const rowG = yAxisGroup
        .append("g")
        .attr("class", "y-label-row")
        .style("cursor", "pointer")
        .on("click", () => onStepClick && onStepClick(t.id));

      // Phase Pill
      rowG
        .append("text")
        .attr("x", margin.left - 10)
        .attr("y", yPos - 7)
        .attr("text-anchor", "end")
        .attr("fill", "#f59e0b")
        .style("font-size", "9px")
        .style("font-family", "monospace")
        .style("font-weight", "bold")
        .text(`Phase ${t.phaseIndex + 1}`);

      // Step Title
      const truncatedTitle = t.stepTitle.length > 26 ? t.stepTitle.substring(0, 24) + "…" : t.stepTitle;
      rowG
        .append("text")
        .attr("x", margin.left - 10)
        .attr("y", yPos + 7)
        .attr("text-anchor", "end")
        .attr("fill", t.completed ? "#10b981" : isLightTheme ? "#1e293b" : "#f1f5f9")
        .style("font-size", "11px")
        .style("font-weight", t.completed ? "bold" : "600")
        .text(truncatedTitle);
    });

    // Draw Task Bars
    const barsGroup = svg.append("g").attr("class", "task-bars");

    tasks.forEach((t) => {
      const x1 = xScale(t.startDate);
      const x2 = xScale(t.endDate);
      const barWidth = Math.max(12, x2 - x1);
      const yPos = yScale(t.id) || 0;
      const barHeight = yScale.bandwidth();

      const fillColor = t.completed
        ? "#10b981" // Completed = Green
        : t.mandatory
        ? "#f59e0b" // Mandatory = Amber
        : "#06b6d4"; // Cyan/Slate

      const barG = barsGroup
        .append("g")
        .attr("class", "task-bar-item")
        .style("cursor", "pointer")
        .on("mouseover", (event) => {
          setHoveredTask(t);
          if (tooltipRef.current) {
            tooltipRef.current.style.opacity = "1";
            tooltipRef.current.style.left = `${event.pageX + 15}px`;
            tooltipRef.current.style.top = `${event.pageY - 28}px`;
          }
        })
        .on("mousemove", (event) => {
          if (tooltipRef.current) {
            tooltipRef.current.style.left = `${event.pageX + 15}px`;
            tooltipRef.current.style.top = `${event.pageY - 28}px`;
          }
        })
        .on("mouseout", () => {
          setHoveredTask(null);
          if (tooltipRef.current) {
            tooltipRef.current.style.opacity = "0";
          }
        })
        .on("click", () => onStepClick && onStepClick(t.id));

      // Bar shadow/background container
      barG
        .append("rect")
        .attr("x", x1)
        .attr("y", yPos)
        .attr("width", barWidth)
        .attr("height", barHeight)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("fill", fillColor)
        .attr("fill-opacity", t.completed ? 0.85 : 0.7)
        .attr("stroke", fillColor)
        .attr("stroke-width", 1.5);

      // Duration label on top of bar
      if (barWidth > 35) {
        barG
          .append("text")
          .attr("x", x1 + barWidth / 2)
          .attr("y", yPos + barHeight / 2 + 3.5)
          .attr("text-anchor", "middle")
          .attr("fill", "#000000")
          .style("font-size", "10px")
          .style("font-family", "monospace")
          .style("font-weight", "bold")
          .text(`${t.durationDays}d`);
      }
    });

    // Draw Dependency Connectors if enabled
    if (showDependencies) {
      const depGroup = svg.append("g").attr("class", "dependency-arrows");

      tasks.forEach((targetTask) => {
        if (!targetTask.dependencies || targetTask.dependencies.length === 0) return;

        targetTask.dependencies.forEach((depTitle) => {
          if (depTitle.toLowerCase() === "none") return;

          const sourceTask = tasks.find(
            (st) => st.stepTitle.toLowerCase().includes(depTitle.toLowerCase()) || depTitle.toLowerCase().includes(st.stepTitle.toLowerCase())
          );

          if (sourceTask) {
            const sx = xScale(sourceTask.endDate);
            const sy = (yScale(sourceTask.id) || 0) + yScale.bandwidth() / 2;

            const tx = xScale(targetTask.startDate);
            const ty = (yScale(targetTask.id) || 0) + yScale.bandwidth() / 2;

            // Curved connector line
            const midX = (sx + tx) / 2;
            const pathData = `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;

            depGroup
              .append("path")
              .attr("d", pathData)
              .attr("fill", "none")
              .attr("stroke", "#f59e0b")
              .attr("stroke-width", 1.5)
              .attr("stroke-dasharray", "4 2")
              .attr("opacity", 0.6);

            // Arrow head on target
            depGroup
              .append("polygon")
              .attr(
                "points",
                `${tx},${ty} ${tx - 6},${ty - 4} ${tx - 6},${ty + 4}`
              )
              .attr("fill", "#f59e0b");
          }
        });
      });
    }
  }, [roadmap, projectStartDate, isLightTheme, selectedPhaseFilter, showDependencies]);

  const tasksList = prepareGanttTasks();
  const phasesList = Array.from(new Set(roadmap?.phases?.map(p => p.phaseName) || []));

  return (
    <div className="space-y-4 text-left">
      {/* Gantt View Toolbar */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        isLightTheme ? "bg-slate-50 border-slate-200" : "bg-[#0b0e14] border-white/10"
      }`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-amber-400">
              D3 Timeline Graph
            </span>
          </div>

          {/* Phase Filter Dropdown */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <Filter className="w-3.5 h-3.5 text-white/40" />
            <select
              value={selectedPhaseFilter}
              onChange={(e) => setSelectedPhaseFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-xl border font-mono text-xs focus:outline-none cursor-pointer ${
                isLightTheme ? "bg-white border-slate-300 text-slate-800" : "bg-black/60 border-white/10 text-white"
              }`}
            >
              <option value="ALL">All Phases ({tasksList.length} Steps)</option>
              {phasesList.map((ph, idx) => (
                <option key={idx} value={ph}>
                  Phase {idx + 1}: {ph}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend & Toggles */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono">
          <button
            onClick={() => setShowDependencies(!showDependencies)}
            className={`px-3 py-1 rounded-xl border transition cursor-pointer font-bold ${
              showDependencies
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "bg-white/5 border-white/10 text-white/50"
            }`}
          >
            {showDependencies ? "✓ Dependency Arrows On" : "Show Dependencies"}
          </button>

          <div className="flex items-center gap-2 px-2 py-1 bg-black/20 rounded-xl border border-white/5">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Mandatory
            </span>
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-500" /> Standard
            </span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div
        ref={containerRef}
        className={`w-full overflow-x-auto rounded-2xl border p-2 relative min-h-[300px] ${
          isLightTheme ? "bg-white border-slate-200" : "bg-[#070b12] border-white/10"
        }`}
      >
        <svg ref={svgRef} className="w-full h-auto min-w-[650px]" />
      </div>

      {/* Floating Hover Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 pointer-events-none transition-opacity duration-150 opacity-0 bg-slate-900/95 border border-amber-500/40 text-white p-3 rounded-2xl shadow-2xl text-xs space-y-1.5 font-sans max-w-xs backdrop-blur-md"
      >
        {hoveredTask && (
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                Phase {hoveredTask.phaseIndex + 1}: {hoveredTask.phaseName}
              </span>
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                  hoveredTask.completed ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {hoveredTask.completed ? "Done" : "Pending"}
              </span>
            </div>

            <p className="font-bold text-white leading-tight">{hoveredTask.stepTitle}</p>
            <p className="text-[10px] text-white/70 line-clamp-2">{hoveredTask.purpose}</p>

            <div className="pt-1.5 border-t border-white/10 grid grid-cols-2 gap-2 text-[9px] font-mono text-white/60">
              <div>
                <span className="text-white/40">Authority:</span> {hoveredTask.dept}
              </div>
              <div>
                <span className="text-white/40">Duration:</span> {hoveredTask.durationDays} Days
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
