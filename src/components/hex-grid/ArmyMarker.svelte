<script lang="ts">
  interface Props {
    x1: number  // first number position
    y1: number
    x2: number  // second number position
    y2: number
    radius: number
  }

  let { x1, y1, x2, y2, radius }: Props = $props()

  // Center of the oval: midpoint between the two number positions
  const cx = $derived((x1 + x2) / 2)
  const cy = $derived((y1 + y2) / 2)

  // Angle of the line connecting the two numbers
  const angle = $derived(Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI))

  // Distance between the two numbers
  const dist = $derived(Math.hypot(x2 - x1, y2 - y1))

  // Ellipse radii: long axis spans both numbers, short axis wraps around them
  const rx = $derived(dist / 2 + radius * 0.18)
  const ry = $derived(radius * 0.22)
</script>

<ellipse
  cx={cx}
  cy={cy}
  rx={rx}
  ry={ry}
  fill="none"
  stroke="var(--color-army)"
  stroke-width="1.5"
  opacity="0.9"
  pointer-events="none"
  transform="rotate({angle}, {cx}, {cy})"
/>
