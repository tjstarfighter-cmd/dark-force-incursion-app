<script lang="ts">
  interface Props {
    cx: number
    cy: number
    radius: number
    status: 'uncaptured' | 'captured' | 'lost'
  }

  let { cx, cy, radius, status }: Props = $props()

  const size = radius * 0.4

  // 5-point star path centered at (0,0)
  function starPath(s: number): string {
    const pts: string[] = []
    for (let i = 0; i < 5; i++) {
      const outerAngle = (Math.PI / 2) + (i * 2 * Math.PI / 5)
      const innerAngle = outerAngle + Math.PI / 5
      pts.push(`${Math.cos(outerAngle) * s},${-Math.sin(outerAngle) * s}`)
      pts.push(`${Math.cos(innerAngle) * s * 0.4},${-Math.sin(innerAngle) * s * 0.4}`)
    }
    return pts.join(' ')
  }

  const star = starPath(size)

  let fillColor = $derived.by(() => {
    switch (status) {
      case 'captured': return 'var(--color-fort-captured)'
      case 'uncaptured': return 'var(--color-fort-uncaptured)'
      case 'lost': return 'rgba(122,122,138,0.4)'
    }
  })

  let glowFilter = $derived(status === 'captured' ? 'url(#fortGlow)' : 'none')
</script>

<g transform="translate({cx},{cy})">
  <polygon
    points={star}
    fill={fillColor}
    stroke={status === 'captured' ? 'rgba(232,184,48,0.6)' : 'none'}
    stroke-width="1"
    filter={glowFilter}
  />

  {#if status === 'lost'}
    <!-- X overlay for lost forts -->
    <line x1={-size * 0.7} y1={-size * 0.7} x2={size * 0.7} y2={size * 0.7}
      stroke="var(--color-dark-force)" stroke-width="2" stroke-linecap="round" />
    <line x1={size * 0.7} y1={-size * 0.7} x2={-size * 0.7} y2={size * 0.7}
      stroke="var(--color-dark-force)" stroke-width="2" stroke-linecap="round" />
  {/if}
</g>
