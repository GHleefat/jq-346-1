import { useSimulationStore } from '../../store/useSimulationStore';
import { formatEnergy, formatTNT, formatNumber } from '../../utils/physics';
import { Zap, CircleDot, Flame, AlertTriangle } from 'lucide-react';

export function ImpactInfo() {
  const { impact, status, asteroid } = useSimulationStore();

  const getImpactLevel = (tnt: number) => {
    if (tnt >= 1e12) return { level: '灭绝级', color: 'text-red-500', bg: 'bg-red-500/20' };
    if (tnt >= 1e9) return { level: '全球灾难', color: 'text-orange-500', bg: 'bg-orange-500/20' };
    if (tnt >= 1e6) return { level: '区域破坏', color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
    if (tnt >= 1e3) return { level: '局部影响', color: 'text-blue-500', bg: 'bg-blue-500/20' };
    return { level: '轻微影响', color: 'text-green-500', bg: 'bg-green-500/20' };
  };

  const impactLevel = getImpactLevel(impact.tntEquivalent);

  if (status === 'idle' || status === 'dragging') {
    return (
      <div className="absolute top-4 right-4 w-72 bg-slate-900/90 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-blue-400" />
          <h2 className="text-white font-semibold">准备就绪</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>陨石直径</span>
            <span className="text-orange-400 font-mono">{asteroid.size} m</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>初始速度</span>
            <span className="text-blue-400 font-mono">{asteroid.velocity} km/s</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>入射角度</span>
            <span className="text-green-400 font-mono">{asteroid.angle}°</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-700/50">
          <p className="text-slate-400 text-xs text-center">
            调整参数后点击发射按钮或直接点击小行星
          </p>
        </div>
      </div>
    );
  }

  if (status === 'flying') {
    return (
      <div className="absolute top-4 right-4 w-72 bg-slate-900/90 backdrop-blur-md rounded-xl shadow-2xl border border-orange-500/50 p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-orange-500 animate-bounce" />
          <h2 className="text-orange-400 font-semibold">陨石进入大气层</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>燃烧状态</span>
            <span className={`font-mono ${asteroid.isBurning ? 'text-orange-400' : 'text-slate-500'}`}>
              {asteroid.isBurning ? `🔥 ${(asteroid.burnIntensity * 100).toFixed(0)}%` : '正常'}
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>当前速度</span>
            <span className="text-blue-400 font-mono">
              {(asteroid.velocityVector.length() * 1000).toFixed(1)} km/s
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!impact.occurred) return null;

  return (
    <div className="absolute top-4 right-4 w-80 bg-slate-900/90 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
      <div className={`px-4 py-3 ${impactLevel.bg} border-b border-slate-700/50`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className={`w-5 h-5 ${impactLevel.color}`} />
            <h2 className="text-white font-semibold">撞击数据</h2>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${impactLevel.bg} ${impactLevel.color}`}>
            {impactLevel.level}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-slate-400 text-xs">撞击能量</span>
            </div>
            <p className="text-yellow-400 font-mono text-lg font-bold">
              {formatEnergy(impact.energy)}
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-slate-400 text-xs">TNT 当量</span>
            </div>
            <p className="text-orange-400 font-mono text-lg font-bold">
              {formatTNT(impact.tntEquivalent)}
            </p>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <CircleDot className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400 text-xs">陨石坑直径</span>
          </div>
          <p className="text-blue-400 font-mono text-xl font-bold">
            {formatNumber(impact.craterDiameter)} 米
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-slate-400 text-xs mb-2">能量对比参考</div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300">广岛原子弹</span>
              <span className="text-slate-400 font-mono">
                × {(impact.tntEquivalent / 15000).toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div
                className="bg-orange-500 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (impact.tntEquivalent / 15000) * 10)}%` }}
              />
            </div>
          </div>
          {impact.tntEquivalent >= 1e6 && (
            <div className="space-y-1.5 mt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">沙皇氢弹</span>
                <span className="text-slate-400 font-mono">
                  × {(impact.tntEquivalent / 50e6).toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div
                  className="bg-red-500 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, (impact.tntEquivalent / 50e6) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-700/50">
          <p className="text-slate-400 text-xs text-center">
            坐标: ({impact.position.x.toFixed(2)}, {impact.position.y.toFixed(2)}, {impact.position.z.toFixed(2)})
          </p>
        </div>
      </div>
    </div>
  );
}
