<script lang="ts">
  import { RULE_CATEGORIES, RULES_BY_ID } from '../../data/rulesContent'
  import type { GameRule } from '../../data/rulesContent'

  interface Props {
    contextRuleIds: string[]
    onClose: () => void
  }

  let { contextRuleIds, onClose }: Props = $props()

  let mode = $state<'contextual' | 'browse'>('contextual')
  let expandedCategories = $state<Set<string>>(new Set())

  const contextRules = $derived(
    contextRuleIds
      .map(id => RULES_BY_ID.get(id))
      .filter((r): r is GameRule => r !== undefined)
  )

  function switchToBrowse() {
    mode = 'browse'
  }

  function switchToContextual() {
    mode = 'contextual'
  }

  function toggleCategory(categoryId: string) {
    const next = new Set(expandedCategories)
    if (next.has(categoryId)) {
      next.delete(categoryId)
    } else {
      next.add(categoryId)
    }
    expandedCategories = next
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="rules-backdrop" onclick={handleBackdropClick} role="presentation">
  <div class="rules-panel" role="dialog" aria-label="Rules Reference">
    <div class="rules-header">
      <h3>
        {#if mode === 'contextual'}
          Relevant Rules
        {:else}
          Game Rules
        {/if}
      </h3>
      <button class="close-btn" onclick={onClose} aria-label="Close rules reference">&times;</button>
    </div>

    <div class="rules-content">
      {#if mode === 'contextual'}
        {#if contextRules.length === 0}
          <p class="empty-state">No specific rules for the current state.</p>
        {:else}
          {#each contextRules as rule (rule.id)}
            <div class="rule-card">
              <h4 class="rule-title">{rule.title}</h4>
              <p class="rule-desc">{rule.description}</p>
            </div>
          {/each}
        {/if}

        <button class="browse-link" onclick={switchToBrowse}>Browse all rules</button>
      {:else}
        <button class="browse-link back-link" onclick={switchToContextual}>Back to relevant rules</button>

        {#each RULE_CATEGORIES as category (category.id)}
          <div class="category">
            <button
              class="category-header"
              onclick={() => toggleCategory(category.id)}
              aria-expanded={expandedCategories.has(category.id)}
            >
              <span class="category-name">{category.name}</span>
              <span class="category-chevron" class:expanded={expandedCategories.has(category.id)}>&#9654;</span>
            </button>

            {#if expandedCategories.has(category.id)}
              <div class="category-rules">
                {#each category.rules as rule (rule.id)}
                  <div class="rule-card">
                    <h4 class="rule-title">{rule.title}</h4>
                    <p class="rule-desc">{rule.description}</p>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .rules-backdrop {
    position: fixed;
    inset: 0;
    z-index: var(--z-overlay, 200);
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .rules-panel {
    background: var(--color-bg-surface, #25253e);
    border-top-left-radius: var(--border-radius-lg, 12px);
    border-top-right-radius: var(--border-radius-lg, 12px);
    width: 100%;
    max-height: 60vh;
    display: flex;
    flex-direction: column;
    padding-bottom: 56px;
  }

  .rules-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-sm, 8px) var(--space-md, 16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .rules-header h3 {
    margin: 0;
    font-family: var(--font-display, 'Cinzel', serif);
    font-size: var(--text-body, 1rem);
    color: var(--color-text-primary, #e8e0d0);
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--color-text-secondary, #a0a0b0);
    font-size: 1.5rem;
    cursor: pointer;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rules-content {
    overflow-y: auto;
    flex: 1;
    padding: var(--space-sm, 8px) var(--space-md, 16px);
  }

  .rule-card {
    padding: var(--space-sm, 8px) 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  .rule-title {
    margin: 0 0 4px 0;
    font-family: var(--font-display, 'Cinzel', serif);
    font-size: var(--text-caption, 0.75rem);
    font-weight: 600;
    color: var(--color-text-primary, #e8e0d0);
  }

  .rule-desc {
    margin: 0;
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    line-height: 1.5;
    color: var(--color-text-secondary, #a0a0b0);
  }

  .empty-state {
    color: var(--color-text-secondary, #a0a0b0);
    font-style: italic;
    text-align: center;
    padding: var(--space-md, 16px);
  }

  .browse-link {
    display: block;
    width: 100%;
    padding: var(--space-sm, 8px);
    margin-top: var(--space-sm, 8px);
    background: transparent;
    border: none;
    color: var(--color-hex-claimed, #d4a574);
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    cursor: pointer;
    text-align: center;
  }

  .browse-link:hover {
    text-decoration: underline;
  }

  .back-link {
    text-align: left;
    margin-bottom: var(--space-sm, 8px);
  }

  .category {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .category-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: var(--space-sm, 8px) 0;
    background: transparent;
    border: none;
    cursor: pointer;
    min-height: 44px;
  }

  .category-name {
    font-family: var(--font-display, 'Cinzel', serif);
    font-size: var(--text-caption, 0.75rem);
    font-weight: 600;
    color: var(--color-text-primary, #e8e0d0);
  }

  .category-chevron {
    color: var(--color-text-secondary, #a0a0b0);
    font-size: 0.6rem;
    transition: transform 0.2s ease;
  }

  .category-chevron.expanded {
    transform: rotate(90deg);
  }

  .category-rules {
    padding-left: var(--space-sm, 8px);
  }

  @media (min-width: 1024px) {
    .rules-backdrop {
      align-items: stretch;
      justify-content: flex-end;
    }

    .rules-panel {
      max-width: 30%;
      max-height: none;
      border-radius: 0;
      padding-bottom: 0;
    }
  }
</style>
