// @ts-ignore;
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Mic, MicOff, Loader2 } from 'lucide-react';

export function VoiceInput({
  onTranscript,
  isRecording = false,
  setIsRecording
}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);
  useEffect(() => {
    // 检查浏览器是否支持语音识别
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'zh-CN';
      recognition.onstart = () => {
        setIsProcessing(false);
      };
      recognition.onresult = event => {
        const transcript = event.results[0][0].transcript;
        if (onTranscript) {
          onTranscript(transcript);
        }
      };
      recognition.onerror = event => {
        console.error('语音识别错误:', event.error);
        setIsRecording(false);
        setIsProcessing(false);
      };
      recognition.onend = () => {
        setIsRecording(false);
        setIsProcessing(false);
      };
      recognitionRef.current = recognition;
    }
  }, [onTranscript, setIsRecording]);
  const toggleRecording = () => {
    if (!isSupported || !recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsProcessing(true);
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };
  if (!isSupported) {
    return <div className="text-gray-400 text-sm">
        您的浏览器不支持语音输入功能
      </div>;
  }
  return <Button onClick={toggleRecording} variant={isRecording ? 'default' : 'outline'} className={`${isRecording ? 'bg-red-500 hover:bg-red-600' : 'border-gray-600 text-white hover:bg-gray-700'}`} disabled={isProcessing}>
      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      <span className="ml-2">
        {isProcessing ? '识别中...' : isRecording ? '停止录音' : '语音输入'}
      </span>
    </Button>;
}