type QuillEditorConfig = {
    modules: Record<string, any>;
    formats: Array<string>
}
export const editorConfig: QuillEditorConfig = {
    modules: {
        toolbar: null,
    },
    formats: ['bold', 'italic', 'underline', 'color', 'span']
}