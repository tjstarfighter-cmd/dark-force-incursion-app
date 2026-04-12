<script lang="ts">
  interface Props {
    x1: number
    y1: number
    x2: number
    y2: number
    radius: number
  }

  let { x1, y1, x2, y2, radius }: Props = $props()

  // Center of the rectangle
  const cx = $derived((x1 + x2) / 2)
  const cy = $derived((y1 + y2) / 2)

  // Angle of the line connecting the two number positions
  const angle = $derived(Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI))

  // Distance between the two numbers
  const dist = $derived(Math.hypot(x2 - x1, y2 - y1))

  // Rectangle dimensions: spans both numbers
  const width = $derived(dist + radius * 0.3)
  const height = $derived(radius * 0.32)
</script>

<rect
  x={cx - width / 2}
  y={cy - height / 2}
  width={width}
  height={height}
  rx="2"
  fill="var(--color-dark-force)"
  stroke="rgba(0,0,0,0.3)"
  stroke-width="0.5"
  opacity="0.85"
  pointer-events="none"
  transform="rotate({angle}, {cx}, {cy})"
/>
