<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false }),
    Underline,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder: 'Start writing your article…' }),
  ],
  onCreate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, { emitUpdate: false })
  }
})

onBeforeUnmount(() => editor.value?.destroy())

function setLink() {
  const url = window.prompt('Enter URL', editor.value?.getAttributes('link').href ?? '')
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
  } else {
    editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }
}

const wordCount = computed(() => {
  const text = editor.value?.getText() ?? ''
  return text.trim() ? text.trim().split(/\s+/).length : 0
})

type Btn = {
  label: string
  icon: string
  action: () => void
  active?: () => boolean
  title: string
}

type Sep = { sep: true }

const toolbar = computed<(Btn | Sep)[]>(() => {
  const e = editor.value
  if (!e) return []
  return [
    // Headings
    { title: 'Heading 1', label: 'H1', icon: '', action: () => e.chain().focus().toggleHeading({ level: 1 }).run(), active: () => e.isActive('heading', { level: 1 }) },
    { title: 'Heading 2', label: 'H2', icon: '', action: () => e.chain().focus().toggleHeading({ level: 2 }).run(), active: () => e.isActive('heading', { level: 2 }) },
    { title: 'Heading 3', label: 'H3', icon: '', action: () => e.chain().focus().toggleHeading({ level: 3 }).run(), active: () => e.isActive('heading', { level: 3 }) },
    { sep: true },
    // Inline formatting
    { title: 'Bold', label: '', icon: 'bold', action: () => e.chain().focus().toggleBold().run(), active: () => e.isActive('bold') },
    { title: 'Italic', label: '', icon: 'italic', action: () => e.chain().focus().toggleItalic().run(), active: () => e.isActive('italic') },
    { title: 'Underline', label: '', icon: 'underline', action: () => e.chain().focus().toggleUnderline().run(), active: () => e.isActive('underline') },
    { title: 'Strikethrough', label: '', icon: 'strike', action: () => e.chain().focus().toggleStrike().run(), active: () => e.isActive('strike') },
    { sep: true },
    // Alignment
    { title: 'Align left', label: '', icon: 'align-left', action: () => e.chain().focus().setTextAlign('left').run(), active: () => e.isActive({ textAlign: 'left' }) },
    { title: 'Align center', label: '', icon: 'align-center', action: () => e.chain().focus().setTextAlign('center').run(), active: () => e.isActive({ textAlign: 'center' }) },
    { title: 'Align right', label: '', icon: 'align-right', action: () => e.chain().focus().setTextAlign('right').run(), active: () => e.isActive({ textAlign: 'right' }) },
    { sep: true },
    // Lists & blocks
    { title: 'Bullet list', label: '', icon: 'bullet-list', action: () => e.chain().focus().toggleBulletList().run(), active: () => e.isActive('bulletList') },
    { title: 'Ordered list', label: '', icon: 'ordered-list', action: () => e.chain().focus().toggleOrderedList().run(), active: () => e.isActive('orderedList') },
    { title: 'Blockquote', label: '', icon: 'blockquote', action: () => e.chain().focus().toggleBlockquote().run(), active: () => e.isActive('blockquote') },
    { title: 'Code block', label: '', icon: 'code-block', action: () => e.chain().focus().toggleCodeBlock().run(), active: () => e.isActive('codeBlock') },
    { title: 'Inline code', label: '', icon: 'code', action: () => e.chain().focus().toggleCode().run(), active: () => e.isActive('code') },
    { title: 'Divider', label: '', icon: 'hr', action: () => e.chain().focus().setHorizontalRule().run() },
    { sep: true },
    // Link
    { title: 'Link', label: '', icon: 'link', action: setLink, active: () => e.isActive('link') },
    { sep: true },
    // History
    { title: 'Undo', label: '', icon: 'undo', action: () => e.chain().focus().undo().run() },
    { title: 'Redo', label: '', icon: 'redo', action: () => e.chain().focus().redo().run() },
  ]
})
</script>

<template>
  <div class="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/20">

    <!-- ── Toolbar ───────────────────────────────────────────────────────────── -->
    <div class="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-gray-100 bg-gray-50/90 px-2 py-1.5 backdrop-blur-sm">
      <template v-for="(item, i) in toolbar" :key="i">
        <!-- Separator -->
        <div v-if="'sep' in item" class="mx-1 h-5 w-px bg-gray-200" />

        <!-- Button -->
        <button
          v-else
          type="button"
          :title="item.title"
          :class="[
            'flex h-7 w-7 items-center justify-center rounded text-sm transition-colors',
            item.active?.()
              ? 'bg-brand-100 text-brand-700'
              : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800',
          ]"
          @click="item.action()"
        >
          <!-- Bold -->
          <svg v-if="item.icon === 'bold'" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
          <!-- Italic -->
          <svg v-else-if="item.icon === 'italic'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
          <!-- Underline -->
          <svg v-else-if="item.icon === 'underline'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" y1="20" x2="20" y2="20"/></svg>
          <!-- Strikethrough -->
          <svg v-else-if="item.icon === 'strike'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 20H7a3 3 0 0 1-2.83-4"/><line x1="4" y1="12" x2="20" y2="12"/></svg>
          <!-- Align left -->
          <svg v-else-if="item.icon === 'align-left'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
          <!-- Align center -->
          <svg v-else-if="item.icon === 'align-center'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
          <!-- Align right -->
          <svg v-else-if="item.icon === 'align-right'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
          <!-- Bullet list -->
          <svg v-else-if="item.icon === 'bullet-list'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
          <!-- Ordered list -->
          <svg v-else-if="item.icon === 'ordered-list'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="2" y="9" font-size="8" fill="currentColor" stroke="none" font-weight="bold">1</text><text x="2" y="15" font-size="8" fill="currentColor" stroke="none" font-weight="bold">2</text><text x="2" y="21" font-size="8" fill="currentColor" stroke="none" font-weight="bold">3</text></svg>
          <!-- Blockquote -->
          <svg v-else-if="item.icon === 'blockquote'" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
          <!-- Code block -->
          <svg v-else-if="item.icon === 'code-block'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          <!-- Inline code -->
          <svg v-else-if="item.icon === 'code'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 20l4-16"/><path d="M14 8l6 4-6 4M10 8L4 12l6 4"/></svg>
          <!-- HR -->
          <svg v-else-if="item.icon === 'hr'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="7" x2="7" y2="7"/><line x1="3" y1="17" x2="7" y2="17"/></svg>
          <!-- Link -->
          <svg v-else-if="item.icon === 'link'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <!-- Undo -->
          <svg v-else-if="item.icon === 'undo'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
          <!-- Redo -->
          <svg v-else-if="item.icon === 'redo'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
          <!-- Heading labels (H1/H2/H3) -->
          <span v-else class="text-xs font-bold">{{ item.label }}</span>
        </button>
      </template>
    </div>

    <!-- ── Writing area ──────────────────────────────────────────────────────── -->
    <EditorContent
      :editor="editor"
      class="editor-content flex-1 px-6 py-5"
    />

    <!-- ── Status bar ────────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-end border-t border-gray-100 bg-gray-50 px-4 py-1.5 text-xs text-gray-400">
      {{ wordCount }} words
    </div>
  </div>
</template>

<style>
/* Writing area typography */
.editor-content .ProseMirror {
  min-height: 420px;
  outline: none;
  font-size: 1rem;
  line-height: 1.85;
  color: #1f2937;
}

/* Placeholder */
.editor-content .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: #9ca3af;
  pointer-events: none;
  float: left;
  height: 0;
}

/* Headings */
.editor-content .ProseMirror h1 { font-size: 1.875rem; font-weight: 800; line-height: 1.2; margin: 1.5rem 0 0.75rem; }
.editor-content .ProseMirror h2 { font-size: 1.5rem;   font-weight: 700; line-height: 1.3; margin: 1.25rem 0 0.6rem; }
.editor-content .ProseMirror h3 { font-size: 1.25rem;  font-weight: 700; line-height: 1.4; margin: 1rem 0 0.5rem; }

/* Paragraphs */
.editor-content .ProseMirror p { margin-bottom: 1rem; }

/* Lists */
.editor-content .ProseMirror ul { list-style: disc;    padding-left: 1.75rem; margin-bottom: 1rem; }
.editor-content .ProseMirror ol { list-style: decimal; padding-left: 1.75rem; margin-bottom: 1rem; }
.editor-content .ProseMirror li { margin-bottom: 0.35rem; }

/* Blockquote */
.editor-content .ProseMirror blockquote {
  border-left: 4px solid #6366f1;
  background: #f5f3ff;
  padding: 0.75rem 1.25rem;
  margin: 1.25rem 0;
  border-radius: 0 0.5rem 0.5rem 0;
  color: #4b5563;
  font-style: italic;
}

/* Code */
.editor-content .ProseMirror code {
  background: #f3f4f6;
  color: #7c3aed;
  border-radius: 0.25rem;
  padding: 0.1em 0.4em;
  font-family: ui-monospace, monospace;
  font-size: 0.875em;
}
.editor-content .ProseMirror pre {
  background: #111827;
  color: #f9fafb;
  padding: 1.25rem 1.5rem;
  border-radius: 0.75rem;
  overflow-x: auto;
  margin: 1.25rem 0;
  font-size: 0.9em;
}
.editor-content .ProseMirror pre code {
  background: transparent;
  color: inherit;
  padding: 0;
}

/* HR */
.editor-content .ProseMirror hr {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 2rem 0;
}

/* Link */
.editor-content .ProseMirror a {
  color: #6366f1;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* Selection */
.editor-content .ProseMirror ::selection { background: #ede9fe; }
</style>
