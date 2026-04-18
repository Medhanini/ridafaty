<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false }),
  ],
  onCreate({ editor }) {
    // Sync the initial HTML so the parent's v-model reflects the real value
    // (TipTap stores '' as '<p></p>' internally; without this, form.content stays '')
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
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-gray-300 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
    <!-- Toolbar -->
    <div class="flex flex-wrap gap-0.5 border-b border-gray-200 bg-gray-50 p-1.5">
      <button
        type="button"
        :class="['rounded px-2 py-1 text-xs font-bold transition-colors', editor?.isActive('bold') ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-200']"
        @click="editor?.chain().focus().toggleBold().run()"
      >B</button>
      <button
        type="button"
        :class="['rounded px-2 py-1 text-xs italic transition-colors', editor?.isActive('italic') ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-200']"
        @click="editor?.chain().focus().toggleItalic().run()"
      >I</button>
      <button
        type="button"
        :class="['rounded px-2 py-1 text-xs font-bold transition-colors', editor?.isActive('strike') ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-200']"
        @click="editor?.chain().focus().toggleStrike().run()"
      ><s>S</s></button>
      <div class="mx-1 w-px bg-gray-300" />
      <button
        type="button"
        :class="['rounded px-2 py-1 text-xs font-bold transition-colors', editor?.isActive('heading', { level: 1 }) ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-200']"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
      >H1</button>
      <button
        type="button"
        :class="['rounded px-2 py-1 text-xs font-bold transition-colors', editor?.isActive('heading', { level: 2 }) ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-200']"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
      >H2</button>
      <button
        type="button"
        :class="['rounded px-2 py-1 text-xs font-bold transition-colors', editor?.isActive('heading', { level: 3 }) ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-200']"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
      >H3</button>
      <div class="mx-1 w-px bg-gray-300" />
      <button
        type="button"
        :class="['rounded px-2 py-1 text-xs transition-colors', editor?.isActive('bulletList') ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-200']"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >• List</button>
      <button
        type="button"
        :class="['rounded px-2 py-1 text-xs transition-colors', editor?.isActive('orderedList') ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-200']"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >1. List</button>
      <button
        type="button"
        :class="['rounded px-2 py-1 text-xs transition-colors', editor?.isActive('blockquote') ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-200']"
        @click="editor?.chain().focus().toggleBlockquote().run()"
      >❝</button>
      <div class="mx-1 w-px bg-gray-300" />
      <button
        type="button"
        :class="['rounded px-2 py-1 text-xs transition-colors', editor?.isActive('link') ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-200']"
        @click="setLink"
      >Link</button>
      <button
        v-if="editor?.isActive('link')"
        type="button"
        class="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
        @click="editor?.chain().focus().unsetLink().run()"
      >Unlink</button>
      <div class="mx-1 w-px bg-gray-300" />
      <button
        type="button"
        class="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
        @click="editor?.chain().focus().undo().run()"
      >↩</button>
      <button
        type="button"
        class="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
        @click="editor?.chain().focus().redo().run()"
      >↪</button>
    </div>
    <!-- Editor area -->
    <EditorContent
      :editor="editor"
      class="prose prose-sm max-w-none px-4 py-3 focus:outline-none [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:outline-none"
    />
  </div>
</template>
