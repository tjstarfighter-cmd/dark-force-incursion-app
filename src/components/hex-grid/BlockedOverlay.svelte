<script lang="ts">
  interface Props {
    points: string
  }

  let { points }: Props = $props()
</script>

<!-- Semi-transparent dark overlay with cross-hatch pattern -->
<polygon
  {points}
  fill="rgba(0, 0, 0, 0.3)"
/>
<polygon
  {points}
  fill="url(#crosshatch)"
/>
