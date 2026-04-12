<script lang="ts">
  import { TerrainType } from '../../types/terrain.types'

  interface Props {
    terrain: TerrainType
    cx: number
    cy: number
    radius: number
    active: boolean
  }

  let { terrain, cx, cy, radius, active }: Props = $props()

  const iconSize = radius * 0.5
  const iconOpacity = active ? 1 : 0.35
</script>

{#if terrain === TerrainType.Mountain}
  <!-- Mountain peak triangle -->
  <g opacity={iconOpacity}>
    <polygon
      points="{cx},{cy - iconSize * 0.7} {cx + iconSize * 0.6},{cy + iconSize * 0.4} {cx - iconSize * 0.6},{cy + iconSize * 0.4}"
      fill="var(--color-terrain-mountain)"
      stroke="rgba(255,255,255,0.2)"
      stroke-width="1"
    />
    <!-- Snow cap -->
    <polygon
      points="{cx},{cy - iconSize * 0.7} {cx + iconSize * 0.2},{cy - iconSize * 0.2} {cx - iconSize * 0.2},{cy - iconSize * 0.2}"
      fill="rgba(255,255,255,0.4)"
    />
  </g>
{/if}
