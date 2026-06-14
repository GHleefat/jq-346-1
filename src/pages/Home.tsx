import { Scene3D } from '../components/Scene3D/Scene3D';
import { ControlPanel } from '../components/UI/ControlPanel';
import { ImpactInfo } from '../components/UI/ImpactInfo';

export default function Home() {
  return (
    <div className="w-full h-screen bg-slate-950 relative overflow-hidden">
      <Scene3D />
      <ControlPanel />
      <ImpactInfo />
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700/50 shadow-xl">
          <p className="text-slate-300 text-sm text-center">
            🪨 <span className="text-blue-400 font-semibold">小行星撞击模拟器</span> | 拖拽小行星调整位置，调节参数后点击发射
          </p>
        </div>
      </div>
    </div>
  );
}
