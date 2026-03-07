import { Node, mergeAttributes } from '@tiptap/core';

export const VideoExtension = Node.create({
    name: 'video',
    group: 'block',
    atom: true,
    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
                renderHTML: attributes => ({ src: attributes.src }),
                parseHTML: element =>
                    (element as HTMLVideoElement).src ||
                    element.querySelector('video')?.getAttribute('src') ||
                    element.getAttribute('src'),
            },
        };
    },

    parseHTML() {
        return [
            { tag: 'div[data-type="video"]' },
            { tag: 'video[src]' },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            { 'data-type': 'video', style: 'margin: 16px 0; text-align: center;' },
            [
                'video',
                mergeAttributes(
                    { controls: '', style: 'max-width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
                    HTMLAttributes
                )
            ],
        ];
    },
});
