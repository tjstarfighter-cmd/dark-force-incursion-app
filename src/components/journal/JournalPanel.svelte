<script lang="ts">
  import type { JournalEntry, JournalScope } from '../../types/journal.types'

  interface Props {
    entries: JournalEntry[]
    currentTurn: number
    draftText: string
    isDesktop?: boolean
    onSaveEntry: (text: string, scope: JournalScope) => void
    onEditEntry: (id: string, newText: string) => void
    onDeleteEntry: (id: string) => void
    onDraftChange: (text: string) => void
    onClose: () => void
  }

  let {
    entries,
    currentTurn,
    draftText,
    isDesktop = false,
    onSaveEntry,
    onEditEntry,
    onDeleteEntry,
    onDraftChange,
    onClose,
  }: Props = $props()

  let scope = $state<JournalScope>('turn')
  let textareaRef: HTMLTextAreaElement | undefined = $state()
  let editingEntryId = $state<string | null>(null)
  let editText = $state('')
  let deletingEntryId = $state<string | null>(null)

  // Auto-focus textarea on mount
  $effect(() => {
    if (textareaRef) {
      textareaRef.focus()
    }
  })

  function handleSave() {
    if (editingEntryId) {
      if (!editText.trim()) return
      onEditEntry(editingEntryId, editText)
      editingEntryId = null
      editText = ''
    } else {
      if (!draftText.trim()) return
      onSaveEntry(draftText, scope)
    }
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement
    if (editingEntryId) {
      editText = target.value
    } else {
      onDraftChange(target.value)
    }
  }

  function startEdit(entry: JournalEntry) {
    editingEntryId = entry.id
    editText = entry.text
    deletingEntryId = null
  }

  function cancelEdit() {
    editingEntryId = null
    editText = ''
  }

  function confirmDelete(id: string) {
    onDeleteEntry(id)
    deletingEntryId = null
    if (editingEntryId === id) {
      editingEntryId = null
      editText = ''
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (!isDesktop && e.target === e.currentTarget) {
      onClose()
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !isDesktop) {
      e.preventDefault()
      onClose()
    }
  }

  // Reverse chronological: newest first
  const sortedEntries = $derived([...entries].reverse())
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isDesktop}
  <div class="journal-side-panel">
    {@render journalContent()}
  </div>
{:else}
  <div class="journal-backdrop" onclick={handleBackdropClick} role="presentation">
    <div class="journal-panel" role="dialog" aria-label="Campaign Journal">
      {@render journalContent()}
    </div>
  </div>
{/if}

{#snippet journalContent()}
  <div class="journal-header">
    <h3>Campaign Journal</h3>
    {#if !isDesktop}
      <button class="close-btn" onclick={onClose} aria-label="Close journal">&times;</button>
    {/if}
  </div>

  <div class="journal-composer">
    <div class="composer-meta">
      <span class="turn-label">Turn {currentTurn}</span>
      <label class="scope-toggle">
        <input
          type="checkbox"
          checked={scope === 'session'}
          onchange={() => scope = scope === 'turn' ? 'session' : 'turn'}
        />
        Session note
      </label>
    </div>

    <textarea
      bind:this={textareaRef}
      class="journal-textarea"
      value={editingEntryId ? editText : draftText}
      oninput={handleInput}
      placeholder={editingEntryId ? "Edit your entry..." : "What happened this turn..."}
      rows="3"
    ></textarea>

    <div class="composer-actions">
      {#if editingEntryId}
        <button
          class="save-btn"
          onclick={handleSave}
          disabled={!editText.trim()}
        >Update</button>
        <button class="cancel-btn" onclick={cancelEdit}>Cancel</button>
      {:else}
        <button
          class="save-btn"
          onclick={handleSave}
          disabled={!draftText.trim()}
        >Save Entry</button>
      {/if}
    </div>
  </div>

  {#if sortedEntries.length > 0}
    <div class="journal-entries">
      {#each sortedEntries as entry (entry.id)}
        <div class="entry" class:editing={editingEntryId === entry.id}>
          <div class="entry-header">
            <span class="entry-turn">
              {entry.scope === 'session' ? 'Session' : `Turn ${entry.turnNumber}`}
            </span>
            <div class="entry-actions">
              <button class="entry-action-btn" onclick={() => startEdit(entry)} title="Edit" aria-label="Edit entry">&#9998;</button>
              <button class="entry-action-btn delete-btn" onclick={() => deletingEntryId = entry.id} title="Delete" aria-label="Delete entry">&times;</button>
            </div>
          </div>
          {#if deletingEntryId === entry.id}
            <div class="delete-confirm">
              <span>Delete this entry?</span>
              <button class="confirm-yes" onclick={() => confirmDelete(entry.id)}>Yes</button>
              <button class="confirm-no" onclick={() => deletingEntryId = null}>No</button>
            </div>
          {:else}
            <p class="entry-text">{entry.text}</p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
{/snippet}

<style>
  .journal-backdrop {
    position: fixed;
    inset: 0;
    z-index: var(--z-overlay, 200);
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .journal-panel {
    background: var(--color-bg-surface, #25253e);
    border-top-left-radius: var(--border-radius-lg, 12px);
    border-top-right-radius: var(--border-radius-lg, 12px);
    width: 100%;
    height: 50vh;
    display: flex;
    flex-direction: column;
    padding-bottom: 56px;
  }

  .journal-side-panel {
    background: var(--color-bg-surface, #25253e);
    width: 30%;
    height: 100vh;
    position: fixed;
    top: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    z-index: var(--z-chrome, 100);
  }

  .journal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-sm, 8px) var(--space-md, 16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .journal-header h3 {
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

  .journal-composer {
    padding: var(--space-sm, 8px) var(--space-md, 16px);
    flex-shrink: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .composer-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-xs, 4px);
  }

  .turn-label {
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    color: var(--color-text-secondary, #a0a0b0);
  }

  .scope-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    color: var(--color-text-secondary, #a0a0b0);
    cursor: pointer;
  }

  .scope-toggle input {
    margin: 0;
  }

  .journal-textarea {
    width: 100%;
    min-height: 60px;
    padding: var(--space-xs, 4px) var(--space-sm, 8px);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-sm, 4px);
    color: var(--color-text-primary, #e8e0d0);
    font-family: inherit;
    font-size: 14px;
    line-height: 1.5;
    resize: vertical;
    box-sizing: border-box;
  }

  .journal-textarea::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .journal-textarea:focus {
    outline: 2px solid var(--color-hex-claimed, #d4a574);
    outline-offset: -2px;
  }

  .composer-actions {
    display: flex;
    gap: var(--space-xs, 4px);
    margin-top: var(--space-xs, 4px);
  }

  .save-btn {
    padding: var(--space-xs, 4px) var(--space-sm, 8px);
    min-height: 36px;
    background: transparent;
    border: 1px solid var(--color-hex-claimed, #d4a574);
    border-radius: var(--border-radius-sm, 4px);
    color: var(--color-hex-claimed, #d4a574);
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    cursor: pointer;
  }

  .save-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .cancel-btn {
    padding: var(--space-xs, 4px) var(--space-sm, 8px);
    min-height: 36px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-sm, 4px);
    color: var(--color-text-secondary, #a0a0b0);
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    cursor: pointer;
  }

  .journal-entries {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-sm, 8px) var(--space-md, 16px);
  }

  .entry {
    padding: var(--space-xs, 4px) 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  .entry.editing {
    background: rgba(212, 165, 116, 0.08);
    border-radius: var(--border-radius-sm, 4px);
    padding: var(--space-xs, 4px);
  }

  .entry-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .entry-turn {
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    color: var(--color-text-secondary, #a0a0b0);
  }

  .entry-actions {
    display: flex;
    gap: 2px;
    opacity: 0.5;
  }

  .entry:hover .entry-actions {
    opacity: 1;
  }

  .entry-action-btn {
    background: transparent;
    border: none;
    color: var(--color-text-secondary, #a0a0b0);
    font-size: 0.85rem;
    cursor: pointer;
    min-width: 28px;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius-sm, 4px);
  }

  .entry-action-btn:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .delete-btn:hover {
    color: var(--color-dark-force, #8b1a1a);
  }

  .delete-confirm {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 4px);
    padding: var(--space-xs, 4px) 0;
    font-family: var(--font-data, 'Inter', sans-serif);
    font-size: var(--text-caption, 0.75rem);
    color: var(--color-text-secondary, #a0a0b0);
  }

  .confirm-yes, .confirm-no {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-sm, 4px);
    color: var(--color-text-secondary, #a0a0b0);
    font-size: var(--text-caption, 0.75rem);
    cursor: pointer;
    padding: 2px 8px;
    min-height: 24px;
  }

  .confirm-yes:hover {
    border-color: var(--color-dark-force, #8b1a1a);
    color: var(--color-dark-force, #8b1a1a);
  }

  .entry-text {
    margin: 2px 0 0;
    font-family: var(--font-display, 'Cinzel', serif);
    font-style: italic;
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-text-primary, #e8e0d0);
  }
</style>
