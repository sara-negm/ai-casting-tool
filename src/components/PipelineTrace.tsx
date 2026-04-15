import type { ExtractedFilters } from '../api/extractFilters';

export interface PipelineData {
  interpretation: string;
  filtersSummary: string;
  filters: ExtractedFilters;
  totalPool: number;
  afterFilter: number;
  ranked: number;
}

interface Props {
  pipeline: PipelineData;
}

export default function PipelineTrace({ pipeline }: Props) {
  return (
    <div className="pipeline-trace">
      <div className="pipeline-header">
        <span className="pipeline-title">System pipeline</span>
        <span className="pipeline-interpretation">“{pipeline.interpretation}”</span>
      </div>
      <div className="pipeline-steps">
        <div className="pipeline-step">
          <span className="pipeline-num">1</span>
          <div className="pipeline-body">
            <p className="pipeline-label">Understood as</p>
            <p className="pipeline-value">{pipeline.filtersSummary}</p>
            <p className="pipeline-hint">Natural-language brief → structured search criteria</p>
          </div>
        </div>
        <div className="pipeline-arrow">→</div>
        <div className="pipeline-step">
          <span className="pipeline-num">2</span>
          <div className="pipeline-body">
            <p className="pipeline-label">Narrowed pool</p>
            <p className="pipeline-value">{pipeline.afterFilter} / {pipeline.totalPool} creators match</p>
            <p className="pipeline-hint">Deterministic filter, runs locally — no AI call</p>
          </div>
        </div>
        <div className="pipeline-arrow">→</div>
        <div className="pipeline-step">
          <span className="pipeline-num">3</span>
          <div className="pipeline-body">
            <p className="pipeline-label">Ranked for fit</p>
            <p className="pipeline-value">{pipeline.ranked} scored + compared</p>
            <p className="pipeline-hint">Each scored vs niche/platform benchmarks, ranked against peers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
