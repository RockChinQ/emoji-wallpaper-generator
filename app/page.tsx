"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Download, Shuffle, Palette } from "lucide-react"

type LayoutMode = "spiral" | "radial" | "large" | "grid" | "mixed"

export default function EmojiWallpaperGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [emojis, setEmojis] = useState(["🐢"])
  const [backgroundColor, setBackgroundColor] = useState("#87CEEB")
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("mixed")
  const [density, setDensity] = useState([50])
  const [emojiSize, setEmojiSize] = useState([40])
  const [canvasWidth] = useState(390) // iPhone width
  const [canvasHeight] = useState(844) // iPhone height

  const generateWallpaper = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // Fill background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Set emoji font
    const baseSize = emojiSize[0]
    ctx.font = `${baseSize}px Arial`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    const positions = generatePositions(layoutMode, density[0])

    positions.forEach(({ x, y, size, emoji }) => {
      ctx.font = `${size}px Arial`
      ctx.fillText(emoji, x, y)
    })
  }

  const generatePositions = (mode: LayoutMode, densityValue: number) => {
    const positions: Array<{ x: number; y: number; size: number; emoji: string }> = []
    const baseSize = emojiSize[0]
    const spacing = Math.max(baseSize * 1.5, 100 - densityValue)

    switch (mode) {
      case "grid":
        const gridSpacing = Math.max(baseSize * 1.8, 80)
        let gridIndex = 0
        for (let x = gridSpacing / 2; x < canvasWidth; x += gridSpacing) {
          for (let y = gridSpacing / 2; y < canvasHeight; y += gridSpacing) {
            const emoji = emojis[gridIndex % emojis.length]
            positions.push({ x, y, size: baseSize, emoji })
            gridIndex++
          }
        }
        break

      case "large":
        const largeSize = baseSize * 1.5
        const largeSpacing = Math.max(largeSize * 1.6, 100)
        let largeIndex = 0
        for (let x = largeSpacing / 2; x < canvasWidth; x += largeSpacing) {
          for (let y = largeSpacing / 2; y < canvasHeight; y += largeSpacing) {
            const emoji = emojis[largeIndex % emojis.length]
            positions.push({ x, y, size: largeSize, emoji })
            largeIndex++
          }
        }
        break

      case "mixed":
        const mixedSpacing = Math.max(baseSize * 1.4, 70)
        let mixedIndex = 0
        for (let x = mixedSpacing / 2; x < canvasWidth; x += mixedSpacing) {
          for (let y = mixedSpacing / 2; y < canvasHeight; y += mixedSpacing) {
            const gridX = Math.floor(x / mixedSpacing) % 3
            const gridY = Math.floor(y / mixedSpacing) % 3

            let size = baseSize
            if ((gridX + gridY) % 2 === 0) {
              size = baseSize * 1.4
            } else if (gridX === 1 && gridY === 1) {
              size = baseSize * 0.7
            }

            // 多emoji时，创建更有规律的分布
            let emojiIndex
            if (emojis.length > 1) {
              // 根据位置和大小选择emoji，创建视觉平衡
              if (size > baseSize) {
                emojiIndex = mixedIndex % Math.min(emojis.length, 3) // 大emoji使用前3个
              } else {
                emojiIndex = (mixedIndex + 2) % emojis.length // 小emoji循环使用
              }
            } else {
              emojiIndex = 0
            }

            const offsetX = (Math.random() - 0.5) * 10
            const offsetY = (Math.random() - 0.5) * 10

            positions.push({
              x: x + offsetX,
              y: y + offsetY,
              size,
              emoji: emojis[emojiIndex],
            })
            mixedIndex++
          }
        }
        break

      case "radial":
        const centerX = canvasWidth / 2
        const centerY = canvasHeight / 2
        const rayCount = 12
        const maxRadius = Math.max(canvasWidth, canvasHeight) * 0.7
        let radialIndex = 0

        for (let ray = 0; ray < rayCount; ray++) {
          const angle = (ray * 2 * Math.PI) / rayCount
          const raySpacing = baseSize * 1.2

          for (let radius = raySpacing; radius < maxRadius; radius += raySpacing) {
            const x = centerX + Math.cos(angle) * radius
            const y = centerY + Math.sin(angle) * radius

            if (x >= 0 && x <= canvasWidth && y >= 0 && y <= canvasHeight) {
              const distanceRatio = radius / maxRadius
              const size = baseSize * (1.2 - distanceRatio * 0.4)

              // 多emoji时，每条射线使用不同的emoji组合
              const emojiIndex = emojis.length > 1 ? (ray + Math.floor(radius / raySpacing)) % emojis.length : 0

              positions.push({
                x,
                y,
                size,
                emoji: emojis[emojiIndex],
              })
              radialIndex++
            }
          }
        }
        break

      case "spiral":
        const spiralCenterX = canvasWidth / 2
        const spiralCenterY = canvasHeight / 2
        const spiralSpacing = baseSize * 0.8
        const maxSpiralRadius = Math.min(canvasWidth, canvasHeight) * 0.4

        let currentRadius = spiralSpacing
        let currentAngle = 0
        const angleIncrement = 0.5
        const radiusIncrement = 2
        let spiralIndex = 0

        while (currentRadius < maxSpiralRadius) {
          const x = spiralCenterX + Math.cos(currentAngle) * currentRadius
          const y = spiralCenterY + Math.sin(currentAngle) * currentRadius

          if (x >= 0 && x <= canvasWidth && y >= 0 && y <= canvasHeight) {
            const spiralProgress = currentRadius / maxSpiralRadius
            const size = baseSize * (1.1 - spiralProgress * 0.3)

            // 多emoji时，螺旋中不同位置使用不同emoji
            const emojiIndex = emojis.length > 1 ? spiralIndex % emojis.length : 0

            positions.push({
              x,
              y,
              size,
              emoji: emojis[emojiIndex],
            })
            spiralIndex++
          }

          currentAngle += angleIncrement
          currentRadius += radiusIncrement
        }
        break
    }

    return positions
  }

  const downloadWallpaper = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `emoji-wallpaper-${emojis.join("")}-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const randomizeSettings = () => {
    const emojisArray = ["🐢", "🦋", "🌸", "⭐", "🍀", "🌙", "☀️", "🌈", "🦄", "🐝", "🌺", "🍄", "🐠", "🦊", "🐨"]
    const colors = ["#87CEEB", "#FFB6C1", "#98FB98", "#DDA0DD", "#F0E68C", "#FFA07A", "#20B2AA", "#87CEFA"]
    const layouts: LayoutMode[] = ["spiral", "radial", "large", "grid", "mixed"]

    const randomEmojiCount = Math.floor(Math.random() * 4) + 1 // 1-4个emoji
    const selectedEmojis = []
    for (let i = 0; i < randomEmojiCount; i++) {
      const randomEmoji = emojisArray[Math.floor(Math.random() * emojisArray.length)]
      if (!selectedEmojis.includes(randomEmoji)) {
        selectedEmojis.push(randomEmoji)
      }
    }
    setEmojis(selectedEmojis.length > 0 ? selectedEmojis : ["🐢"])
    setBackgroundColor(colors[Math.floor(Math.random() * colors.length)])
    setLayoutMode(layouts[Math.floor(Math.random() * layouts.length)])
    setDensity([Math.floor(Math.random() * 80) + 20])
    setEmojiSize([Math.floor(Math.random() * 40) + 30])
  }

  useEffect(() => {
    generateWallpaper()
  }, [emojis, backgroundColor, layoutMode, density, emojiSize])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Emoji壁纸生成器</h1>
          <p className="text-gray-600">创建你专属的emoji壁纸，就像iOS自带的那样！</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                壁纸设置
              </CardTitle>
              <CardDescription>自定义你的emoji壁纸样式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="emojis">选择Emoji (最多6个)</Label>
                <div className="space-y-2">
                  <Input
                    id="emojis"
                    value={emojis.join("")}
                    onChange={(e) => {
                      const inputEmojis = Array.from(e.target.value).slice(0, 6)
                      setEmojis(inputEmojis.length > 0 ? inputEmojis : ["🐢"])
                    }}
                    placeholder="输入emoji，如 🐢🦐😊❤️ (最多6个)"
                    className="text-2xl text-center"
                  />
                  <div className="text-xs text-gray-500 text-center">当前: {emojis.length}/6 个emoji</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background">背景颜色</Label>
                <div className="flex gap-2">
                  <Input
                    id="background"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#87CEEB"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>布局模式</Label>
                <Select value={layoutMode} onValueChange={(value: LayoutMode) => setLayoutMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">大小混合</SelectItem>
                    <SelectItem value="grid">网格</SelectItem>
                    <SelectItem value="large">大</SelectItem>
                    <SelectItem value="radial">射线</SelectItem>
                    <SelectItem value="spiral">螺旋</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>密度: {density[0]}%</Label>
                <Slider value={density} onValueChange={setDensity} max={100} min={10} step={5} className="w-full" />
              </div>

              <div className="space-y-2">
                <Label>Emoji大小: {emojiSize[0]}px</Label>
                <Slider value={emojiSize} onValueChange={setEmojiSize} max={80} min={20} step={5} className="w-full" />
              </div>

              <div className="flex gap-2">
                <Button onClick={randomizeSettings} variant="outline" className="flex-1 bg-transparent">
                  <Shuffle className="w-4 h-4 mr-2" />
                  随机生成
                </Button>
                <Button onClick={downloadWallpaper} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  下载壁纸
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Canvas */}
          <div className="flex justify-center items-center">
            <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} className="border rounded"></canvas>
          </div>
        </div>
      </div>
    </div>
  )
}
