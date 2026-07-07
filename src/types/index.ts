export interface ModalProps {
    isOpen: boolean;
    content: string;
    onClose: () => void;
}

export interface SceneProps {
    backgroundColor: string;
    elements: Array<{
        type: string;
        position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number };
    }>;
}