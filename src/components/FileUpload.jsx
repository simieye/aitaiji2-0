// @ts-ignore;
import React, { useState, useRef } from 'react';
// @ts-ignore;
import { Button, Card, CardContent } from '@/components/ui';
// @ts-ignore;
import { Upload, X, FileText, Image, Film, Music } from 'lucide-react';

export function FileUpload({
  onFileUpload,
  maxSize = 10 * 1024 * 1024,
  // 10MB
  acceptedTypes = ['image/*', 'application/pdf', 'text/*', 'audio/*', 'video/*']
}) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const getFileIcon = type => {
    if (type.startsWith('image/')) return <Image className="w-6 h-6 text-green-500" />;
    if (type.startsWith('video/')) return <Film className="w-6 h-6 text-purple-500" />;
    if (type.startsWith('audio/')) return <Music className="w-6 h-6 text-blue-500" />;
    return <FileText className="w-6 h-6 text-gray-500" />;
  };
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const handleFiles = async files => {
    const validFiles = Array.from(files).filter(file => {
      if (file.size > maxSize) {
        alert(`文件 ${file.name} 超过大小限制`);
        return false;
      }
      return true;
    });
    if (validFiles.length === 0) return;
    setUploading(true);
    try {
      for (const file of validFiles) {
        const fileData = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          url: URL.createObjectURL(file)
        };
        setUploadedFiles(prev => [...prev, fileData]);
        if (onFileUpload) {
          await onFileUpload(fileData);
        }
      }
    } catch (error) {
      console.error('文件上传失败:', error);
    } finally {
      setUploading(false);
    }
  };
  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };
  const handleFileInput = e => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };
  const removeFile = index => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  return <div className="space-y-4">
      <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-red-500 bg-red-500/10' : 'border-gray-600 bg-gray-800/50'}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-300 mb-2">拖拽文件到此处或点击上传</p>
        <p className="text-gray-500 text-sm mb-4">支持图片、PDF、文档、音频、视频格式</p>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
          {uploading ? '上传中...' : '选择文件'}
        </Button>
        <input ref={fileInputRef} type="file" multiple accept={acceptedTypes.join(',')} onChange={handleFileInput} className="hidden" />
      </div>
      
      {uploadedFiles.length > 0 && <div className="space-y-2">
          <h4 className="text-white font-medium">已上传文件</h4>
          {uploadedFiles.map((file, index) => <Card key={index} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.type)}
                    <div>
                      <div className="text-white text-sm font-medium">{file.name}</div>
                      <div className="text-gray-400 text-xs">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>)}
        </div>}
    </div>;
}