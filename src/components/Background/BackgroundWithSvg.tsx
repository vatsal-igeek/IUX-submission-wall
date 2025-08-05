import { BgBottomCenterSvg, BgRightCenterSvg, BgTopLeftSvg } from '../../icons'
import Galaxy from '../animations/Galaxy/Galaxy'

const BackgroundWithSvg = () => {
  return (
    <>
    {/* Galaxy as background */}
    <div className="absolute top-0 left-0 w-full h-full z-10">
        <Galaxy
          mouseRepulsion={false}
          mouseInteraction={false}
          density={0.3}
          glowIntensity={0.15}
          saturation={0}
          hueShift={140}
          rotationSpeed={0.05}
          repulsionStrength={0.1}
          autoCenterRepulsion={0}
          starSpeed={0.05}
          speed={0.2}
          focal={[0.1, 0.1]}
          transparent={true}
        />
      </div>

      {/* BgTopLeftSvg - fixed at top-left */}
      <div className="fixed top-0 left-0 z-20 pointer-events-none">
        <BgTopLeftSvg />
      </div>

      {/* BgRightCenterSvg - right side center */}
      <div className="fixed top-1/2 right-0 -translate-y-1/2 z-20 pointer-events-none">
        <BgRightCenterSvg />
      </div>

      {/* BgBottomCenterSvg - bottom center */}
      <div className="fixed bottom-0 left-0 w-full z-20 pointer-events-none">
        <BgBottomCenterSvg />
      </div>
    </>
  )
}

export default BackgroundWithSvg