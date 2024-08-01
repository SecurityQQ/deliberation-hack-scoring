// components/DragAndDropUpload.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface DragAndDropUploadProps {
  onFileSelect: (file: File) => void;
}

const DragAndDropUpload: React.FC<DragAndDropUploadProps> = ({ onFileSelect }) => {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any) => {
    if (fileRejections.length > 0) {
      setErrorMessage('Unsupported file type. Only images and PDFs are supported.');
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      setErrorMessage(null);
      onFileSelect(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setFileName(file.name);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
      'application/pdf': [".pdf"]
    },
    multiple: false
  });

  return (
    <>
      <div {...getRootProps({ className: 'dropzone mb-4 p-4 border-2 border-dashed rounded-md' })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here ...</p>
        ) : (
          <p>Drag &apos;n&apos; drop a file here, or click to select a file (only images or PDFs are supported)</p>
        )}
      </div>
      {errorMessage && (
        <div className="text-red-500 mb-4">
          {errorMessage}
        </div>
      )}
      {filePreview && (
        <div className="mb-4">
          <p>File uploaded: {fileName}</p>
          {filePreview.includes("data:application/pdf") ? (
            <p>PDF file uploaded</p>
          ) : (
            <img src={filePreview} alt="Preview" className="max-w-64 h-auto" />
          )}
        </div>
      )}
    </>
  );
};

export default DragAndDropUpload;
