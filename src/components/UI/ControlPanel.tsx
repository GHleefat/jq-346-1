import { useSimulationStore } from '../../store/useSimulationStore';
import { DEFAULT_PARAMS } from '../../utils/constants';
import { Rocket, RotateCcw, Target, Gauge, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function ControlPanel() {
  const {
    asteroid,
    status,
    setAsteroidParams,
    launch,
    reset,
    showTrajectory,
    setShowTrajectory,
  } = useSimulationStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const canInteract = status === 'idle' || status === 'dragging';
  const isFlying = status === 'flying';

  const handleSizeChange = (value: number) => {
    setAsteroidParams({ size: value });
  };

  const handleVelocityChange = (value: number) => {
    setAsteroidParams({ velocity: value });
  };

  const handleAngleChange = (value: number) => {
    setAsteroidParams({ angle: value });
  };

  const handleLaunch = () => {
    if (canInteract) {
      launch();
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="absolute top-4 left-4 w-72 bg-slate-900/90 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700/50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" />
          <h2 className="text-white font-semibold">撞击控制</h2>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </div>

      {isExpanded && (
        <div className="p-4 space-y-5">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-slate-300 text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                陨石大小
              </label>
              <span className="text-orange-400 font-mono text-sm">{asteroid.size} m</span>
            </div>
            <input
              type="range"
              min={DEFAULT_PARAMS.MIN_SIZE}
              max={DEFAULT_PARAMS.MAX_SIZE}
              value={asteroid.size}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              disabled={!canInteract}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:bg-orange-500
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{DEFAULT_PARAMS.MIN_SIZE}m</span>
              <span>{DEFAULT_PARAMS.MAX_SIZE}m</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-slate-300 text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                初始速度
              </label>
              <span className="text-blue-400 font-mono text-sm">{asteroid.velocity} km/s</span>
            </div>
            <input
              type="range"
              min={DEFAULT_PARAMS.MIN_VELOCITY}
              max={DEFAULT_PARAMS.MAX_VELOCITY}
              value={asteroid.velocity}
              onChange={(e) => handleVelocityChange(Number(e.target.value))}
              disabled={!canInteract}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:bg-blue-500
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{DEFAULT_PARAMS.MIN_VELOCITY} km/s</span>
              <span>{DEFAULT_PARAMS.MAX_VELOCITY} km/s</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-slate-300 text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                入射角度
              </label>
              <span className="text-green-400 font-mono text-sm">{asteroid.angle}°</span>
            </div>
            <input
              type="range"
              min={DEFAULT_PARAMS.MIN_ANGLE}
              max={DEFAULT_PARAMS.MAX_ANGLE}
              value={asteroid.angle}
              onChange={(e) => handleAngleChange(Number(e.target.value))}
              disabled={!canInteract}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:bg-green-500
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{DEFAULT_PARAMS.MIN_ANGLE}°</span>
              <span>{DEFAULT_PARAMS.MAX_ANGLE}°</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
            <span className="text-slate-300 text-sm">显示轨迹预测</span>
            <button
              onClick={() => setShowTrajectory(!showTrajectory)}
              disabled={!canInteract}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                showTrajectory ? 'bg-blue-500' : 'bg-slate-600'
              } disabled:opacity-50`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                  showTrajectory ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleLaunch}
              disabled={!canInteract}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
                canInteract
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105'
                  : 'bg-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <Rocket className={`w-5 h-5 ${isFlying ? 'animate-bounce' : ''}`} />
              {isFlying ? '飞行中...' : '发射'}
            </button>

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-600 transition-all duration-300 hover:scale-105"
            >
              <RotateCcw className="w-5 h-5" />
              重置
            </button>
          </div>

          <div className="pt-2 border-t border-slate-700/50">
            <p className="text-slate-400 text-xs text-center">
              💡 拖拽小行星调整位置，点击小行星快速发射
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
