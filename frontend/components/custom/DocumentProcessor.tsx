'use client';

/**
 * @fileoverview Component that displays a dynamic document processing visualization
 * with parallel agent activities and real-time progress updates.
 */

import dotenv from 'dotenv';
import { useState, useEffect, useCallback } from 'react';
import {
  Upload,
  X,
  Loader2,
  CheckCircle2,
  Bot,
  Link,
  Sparkles,
  Zap,
  Brain,
  BookOpen,
  Hash,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { BlockchainCTA } from './BlockchainCTA';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import axios from 'axios';
import { ethers } from 'ethers';
import PaymentABI from '../../ABI/Payment.json';
import { useAccount } from 'wagmi';

dotenv.config();

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const CONTRACT_ADDRESS_PAYMENT =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_PAYMENT;
const GOTO_DEPOSIT = process.env.NEXT_PUBLIC_GOTO_DEPOSIT;

// Core configuration
const SUPPORTED_FILE_TYPES = ['PDF', 'TXT'] as const;
const MAX_FILE_SIZE_MB = 10;
const MIN_PROCESSING_TIME = 5000; // Minimum time to show processing state (ms)

// Processing agents with enhanced descriptions and icons
const PROCESSING_AGENTS = [
  {
    id: 'upload',
    name: 'Upload Agent',
    icon: Upload,
    description: 'Securely transferring your document to our servers',
    color: 'blue',
    particles: 3,
  },
  {
    id: 'token',
    name: 'Token Counter',
    icon: Hash,
    description: 'Counting tokens and analysing lexical density',
    color: 'indigo',
    particles: 4,
  },
  {
    id: 'readability',
    name: 'Readability Analyst',
    icon: BookOpen,
    description: 'Calculating readability scores and complexity metrics',
    color: 'emerald',
    particles: 5,
  },
  {
    id: 'description',
    name: 'Description Generator',
    icon: FileText,
    description: 'Generating a concise description of the document content',
    color: 'pink',
    particles: 5,
  },
  {
    id: 'embedding',
    name: 'Embedding Generator',
    icon: Brain,
    description: 'Creating vector embeddings for semantic analysis',
    color: 'violet',
    particles: 6,
  },
];

// Particle animation component
const ParticleEffect = ({
  count,
  color,
  isActive,
}: {
  count: number;
  color: string;
  isActive: boolean;
}) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`absolute w-1 h-1 rounded-full bg-${color}-500/30 animate-particle`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

// Agent activity indicator
const AgentActivity = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;

  return (
    <div className="absolute -right-2 -top-2 w-4 h-4">
      <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-75" />
      <div className="relative w-full h-full bg-accent rounded-full" />
    </div>
  );
};

// Agent card component
const AgentCard = ({
  agent,
  isActive,
  isCompleted,
  progress,
  result,
}: {
  agent: (typeof PROCESSING_AGENTS)[0];
  isActive: boolean;
  isCompleted: boolean;
  progress: number;
  result?: any;
}) => {
  const Icon = agent.icon;

  return (
    <div
      className={`flex flex-col p-4 rounded-lg border relative overflow-hidden transition-all duration-300 ${
        isActive
          ? `border-${agent.color}-500/50 bg-${agent.color}-500/5 shadow-lg shadow-${agent.color}-500/10`
          : isCompleted
            ? 'border-emerald-200 bg-emerald-50/10'
            : 'border-border'
      }`}
    >
      {/* Particle effects for active stage */}
      <ParticleEffect
        count={agent.particles}
        color={agent.color}
        isActive={isActive}
      />

      <div className="flex items-center mb-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 relative ${
            isActive
              ? `bg-${agent.color}-500/10 text-${agent.color}-500`
              : isCompleted
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-muted text-secondary'
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Icon className="w-5 h-5" />
          )}

          {/* Agent activity indicator */}
          <AgentActivity isActive={isActive} />
        </div>

        <div>
          <h4 className="font-medium">{agent.name}</h4>
          <p className="text-xs text-secondary">
            {isActive
              ? agent.description
              : isCompleted
                ? 'Completed'
                : 'Standing by'}
          </p>
        </div>

        {isActive && (
          <div className="ml-auto flex items-center">
            <Loader2
              className={`w-4 h-4 text-${agent.color}-500 animate-spin mr-2`}
            />
            <Zap className={`w-4 h-4 text-${agent.color}-500 animate-pulse`} />
          </div>
        )}
      </div>

      {/* Result display */}
      {isCompleted && result && (
        <div className="mt-2 text-sm">
          {agent.id === 'token' && (
            <div className="flex justify-between">
              <span>Token Count:</span>
              <span className="font-bold">{result.tokenCount}</span>
            </div>
          )}
          {agent.id === 'token' && (
            <div className="flex justify-between">
              <span>Lexical Density:</span>
              <span className="font-bold">
                {result.lexicalDensity?.toFixed(2)}%
              </span>
            </div>
          )}
          {agent.id === 'readability' && (
            <div className="flex justify-between">
              <span>Readability Score:</span>
              <span className="font-bold">
                {result.readability?.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      {(isActive || isCompleted) && (
        <div className="w-full bg-muted rounded-full h-1 mt-3">
          <div
            className={`h-1 rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-emerald-500' : `bg-${agent.color}-500`
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

interface DocumentProcessorProps {
  onClose: () => void;
  onComplete?: (result: any) => void;
  file?: File;
}

export default function DocumentProcessor({
  onClose,
  onComplete,
  file,
}: DocumentProcessorProps) {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(file || null);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [completedAgents, setCompletedAgents] = useState<string[]>([]);
  const [agentProgress, setAgentProgress] = useState<Record<string, number>>(
    {}
  );
  const [agentResults, setAgentResults] = useState<Record<string, any>>({});
  const [similarDocuments, setSimilarDocuments] = useState<any[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState<boolean>(false);
  const [showBlockchainStage, setShowBlockchainStage] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();

  // Load data from localStorage when component mounts
  useEffect(() => {
    const currentData = localStorage.getItem('currentUploadData');
    if (currentData) {
      const data = JSON.parse(currentData);
      if (data.description) {
        setDescription(data.description);
      }
    }
  }, []);

  // Function to update onBlockchain status in localStorage
  const updateBlockchainStatus = (documentHash: string) => {
    const currentData = localStorage.getItem('currentUploadData');
    if (currentData) {
      const data = JSON.parse(currentData);
      if (data.documentHash === documentHash) {
        data.onBlockchain = true;
        localStorage.setItem('currentUploadData', JSON.stringify(data));
      }
    }
  };

  // Function declaration (hoisted) instead of useCallback
  async function handleFileUpload(file: File) {
    console.log('Starting file upload:', file.name);
    if (!validateFile(file)) {
      return;
    }

    setIsProcessing(true);
    setUploadedFile(file);
    const uploadInterval = simulateUpload();

    // Show processing toast
    const processingToast = toast.loading('Processing your document...', {
      description: 'This may take a few moments',
      className: 'bg-background text-foreground border-border',
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Sending file to server...');
      const response = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      console.log('File uploaded successfully, processing response...');
      const result = await response.json();
      console.log('Analysis result:', result);

      // Start simulating agent processing
      const cleanupAgents = simulateAgentProcessing(result);

      // Ensure minimum processing time
      await new Promise((resolve) => setTimeout(resolve, MIN_PROCESSING_TIME));

      // Set final analysis result - use only actual server data
      const finalResult = result;

      // Store the upload data in localStorage
      localStorage.setItem(
        'currentUploadData',
        JSON.stringify({
          ...finalResult,
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          onBlockchain: false,
        })
      );

      setAnalysisResult(finalResult);

      // Clean up intervals and finish processing stage
      cleanupAgents();
      setIsProcessing(false);

      // Start similar documents search stage
      setIsLoadingSimilar(true);
      try {
        console.log('Embedding data:', finalResult.embedding);
        const vector = Object.values(finalResult.embedding || {}).join(',');
        console.log('Vector for similarity search:', vector);

        const similarResponse = await fetch(
          `${BACKEND_URL}/similar-documents?vector=${vector}`
        );

        if (!similarResponse.ok) {
          throw new Error('Failed to fetch similar documents');
        }

        const similarDocs = await similarResponse.json();
        console.log('Similar documents received:', similarDocs);
        setSimilarDocuments(similarDocs);
        console.log(
          'Similar documents state set:',
          similarDocs.length,
          'items'
        );
      } catch (err) {
        console.error('Error fetching similar documents:', err);
        toast.error('Unable to fetch similar documents', {
          description:
            'Please ensure your backend connection is properly configured.',
          className: 'bg-background text-foreground border-border',
        });
      } finally {
        setIsLoadingSimilar(false);
        console.log('isLoadingSimilar set to false');
      }

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(finalResult);
      }

      // Update toast to success
      toast.dismiss(processingToast);
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);

      // Update toast to error
      toast.dismiss(processingToast);
      toast.error('Upload Failed', {
        description: errorMessage,
        className: 'bg-background text-foreground border-border',
      });
    } finally {
      clearInterval(uploadInterval);
    }
  }

  useEffect(() => {
    setIsMounted(true); // for CSR
  }, []);

  // Start processing if file is provided
  useEffect(() => {
    if (file && !isProcessing && !analysisResult && !error) {
      handleFileUpload(file);
    }
  }, [file, isProcessing, analysisResult, error]);

  // Add keyframe animation for particles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes particle {
        0% {
          transform: translate(0, 0) scale(1);
          opacity: 0;
        }
        50% {
          opacity: 0.5;
        }
        100% {
          transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0);
          opacity: 0;
        }
      }
      .animate-particle {
        animation: particle 2s infinite;
      }
      
      @keyframes float {
        0% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
        100% {
          transform: translateY(0px);
        }
      }
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
      
      @keyframes pulse-ring {
        0% {
          transform: scale(0.8);
          opacity: 0.5;
        }
        50% {
          transform: scale(1.2);
          opacity: 0.2;
        }
        100% {
          transform: scale(0.8);
          opacity: 0.5;
        }
      }
      .animate-pulse-ring {
        animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      
      @keyframes shimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
      .animate-shimmer {
        animation: shimmer 2s infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  /**
   * Validates a file for upload
   * @param file - The file to validate
   * @returns boolean indicating if the file is valid
   */
  const validateFile = (file: File): boolean => {
    console.log('Validating file:', file.name);
    // Reset any previous errors
    setError(null);

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toUpperCase();
    if (
      !fileExtension ||
      !SUPPORTED_FILE_TYPES.includes(fileExtension as any)
    ) {
      const errorMsg = `Unsupported file type. Please use: ${SUPPORTED_FILE_TYPES.join(', ')}`;
      setError(errorMsg);
      toast.error('Invalid File Type', {
        description: errorMsg,
        className: 'bg-background text-foreground border-border',
      });
      return false;
    }

    // Check file size (convert MB to bytes)
    const maxSizeBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const errorMsg = `File too large. Maximum size: ${MAX_FILE_SIZE_MB}MB`;
      setError(errorMsg);
      toast.error('File Too Large', {
        description: errorMsg,
        className: 'bg-background text-foreground border-border',
      });
      return false;
    }

    return true;
  };

  const simulateUpload = () => {
    setUploadProgress(0);
    setActiveAgents(['upload']);
    setCompletedAgents([]);
    setAgentProgress({});
    setAgentResults({});

    // Simulate upload progress with smoother animation
    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setCompletedAgents((prev) => [...prev, 'upload']);
          setActiveAgents((prev) => prev.filter((id) => id !== 'upload'));
          return 100;
        }
        return prev + 2;
      });

      // Update agent progress
      setAgentProgress((prev) => ({
        ...prev,
        upload: uploadProgress,
      }));
    }, 50);

    return uploadInterval;
  };

  const simulateAgentProcessing = (result: any) => {
    // Start with upload agent
    const agents = [
      'token',
      'readability',
      'description',
      'embedding',
      'verification',
    ];
    const intervals: Record<string, NodeJS.Timeout> = {};

    // Randomly activate agents with delays
    agents.forEach((agentId, index) => {
      const delay = Math.random() * 2000 + 500; // Random delay between 500-2500ms

      setTimeout(() => {
        setActiveAgents((prev) => [...prev, agentId]);

        // Create progress interval for this agent
        intervals[agentId] = setInterval(() => {
          setAgentProgress((prev) => {
            const currentProgress = prev[agentId] || 0;
            if (currentProgress >= 100) {
              clearInterval(intervals[agentId]);
              setCompletedAgents((prev) => [...prev, agentId]);
              setActiveAgents((prev) => prev.filter((id) => id !== agentId));

              // Set mock results based on agent type
              if (agentId === 'token') {
                setAgentResults((prev) => ({
                  ...prev,
                  token: {
                    tokenCount: result?.tokenCount || 0,
                    lexicalDensity: result?.lexicalDensity || 0,
                  },
                }));
              } else if (agentId === 'readability') {
                setAgentResults((prev) => ({
                  ...prev,
                  readability: {
                    readability: result?.readability || 0,
                  },
                }));
              } else if (agentId === 'description') {
                setAgentResults((prev) => ({
                  ...prev,
                  description: {
                    description:
                      result?.description || 'No description available',
                  },
                }));
              } else if (agentId === 'embedding') {
                setAgentResults((prev) => ({
                  ...prev,
                  embedding: {
                    dimensions: result?.embedding?.dimensions || 0,
                    status: 'complete',
                  },
                }));
              }

              return prev;
            }
            return {
              ...prev,
              [agentId]: currentProgress + (Math.random() * 3 + 1),
            };
          });
        }, 100);
      }, delay);
    });

    return () => {
      Object.values(intervals).forEach((interval) => clearInterval(interval));
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    };
    input.click();
  };

  const handleBlockchainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS_PAYMENT!,
        PaymentABI,
        signer
      );

      try {
        const tx = await contract.increaseDeposit({
          value: ethers.parseEther(GOTO_DEPOSIT!),
        });
        await tx.wait();
      } catch (error: any) {
        // Handle MetaMask transaction rejection
        if (
          error.code === 4001 ||
          error.message?.includes('denied transaction signature')
        ) {
          toast.error('Transaction Rejected', {
            description:
              'You have rejected the transaction. Please try again if you want to proceed.',
            className: 'bg-background text-foreground border-border',
          });
          setIsLoading(false);
          return;
        }
        throw error; // Re-throw other errors
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('url', url);
      formData.append('description', description);
      formData.append('publicKey', address!);
      formData.append('fileName', title.toLowerCase().replace(/\s+/g, '-'));

      if (analysisResult?.documentHash) {
        formData.append('documentHash', analysisResult.documentHash);
      }

      // Add vector data if available
      if (analysisResult?.embedding) {
        const vector = Object.values(analysisResult.embedding).join(',');
        formData.append('vector', vector);
      }

      // Add analysis metrics
      if (analysisResult) {
        formData.append(
          'tokenCount',
          analysisResult.tokenCount?.toString() || '0'
        );
        formData.append(
          'lexicalDensity',
          analysisResult.lexicalDensity?.toString() || '0'
        );
        formData.append(
          'readability',
          analysisResult.readability?.toString() || '0'
        );
      }

      const response = await axios.post(`${BACKEND_URL}/broadcast`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Check for error in response
      if (response.data.error) {
        toast.error(response.data.error, {
          description: response.data.message || 'An error occurred',
          className: 'bg-background text-foreground border-border',
        });
        return;
      }

      // Generate a short ID for the upload
      const shortId = Math.random().toString(36).substring(2, 8);
      const uploadKey = `upload_${shortId}`;

      // Store the upload data in localStorage
      localStorage.setItem(
        uploadKey,
        JSON.stringify({
          documentHash: response.data.documentHash,
          documentHashIndex: response.data.documentHashIndex,
          timestamp: new Date().toISOString(),
          title,
          url,
          description,
        })
      );

      toast.success('Document added to blockchain successfully', {
        description: 'Your document has been securely stored on the blockchain',
        className: 'bg-background text-foreground border-border',
      });
      setShowBlockchainStage(false);
    } catch (error: any) {
      console.error('Error:', error);

      // Handle axios error response
      if (error.response?.data) {
        const { error: errorMessage, message, details } = error.response.data;
        toast.error(errorMessage || 'Failed to add document to blockchain', {
          description: message || 'Please try again later',
          className: 'bg-background text-foreground border-border',
        });
      } else {
        toast.error('Failed to add document to blockchain', {
          description: error.message || 'Please try again later',
          className: 'bg-background text-foreground border-border',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-0">
      {(() => {
        console.log('Main render state:', {
          isMounted,
          isProcessing,
          hasError: !!error,
          hasAnalysisResult: !!analysisResult,
          uploadProgress,
          isLoadingSimilar,
          similarDocumentsCount: similarDocuments.length,
        });
        return null;
      })()}
      <div className="card w-full h-full max-w-full p-8 relative flex flex-col overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Stage 1: Initial Processing */}
        {isProcessing && (
          <div className="flex flex-col h-full">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 relative">
                <Bot className="w-8 h-8 text-accent animate-float" />
                <div
                  className="absolute inset-0 rounded-full border-2 border-accent/20 border-t-accent animate-spin"
                  style={{ animationDuration: '2s' }}
                />
                <Sparkles className="w-4 h-4 text-accent absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h3 className="text-xl font-medium mb-2">
                AI Agents Processing Your Document
              </h3>
              <p className="text-secondary mb-6">
                Our specialised AI agents are analysing your document in
                parallel
              </p>
            </div>

            {/* Progress bar with glow effect */}
            <div className="w-full bg-muted rounded-full h-2 mb-4 relative overflow-hidden">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-300 relative"
                style={{ width: `${uploadProgress}%` }}
              >
                <div className="absolute inset-0 bg-accent/50 blur-sm" />
              </div>
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-transparent animate-shimmer"
                style={{ width: '200%', left: '-100%' }}
              />
            </div>
            <p className="text-sm text-secondary mb-8">
              {uploadProgress}% complete
            </p>

            {/* Agent grid layout */}
            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PROCESSING_AGENTS.map((agent) => {
                  const isActive = activeAgents.includes(agent.id);
                  const isCompleted = completedAgents.includes(agent.id);
                  const progress = agentProgress[agent.id] || 0;
                  const result = agentResults[agent.id];

                  return (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      isActive={isActive}
                      isCompleted={isCompleted}
                      progress={progress}
                      result={result}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Stage 2: Searching Similar Documents */}
        {!isProcessing && isLoadingSimilar && (
          <div className="flex flex-col h-full">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 relative">
                <Link className="w-8 h-8 text-accent animate-float" />
                <div
                  className="absolute inset-0 rounded-full border-2 border-accent/20 border-t-accent animate-spin"
                  style={{ animationDuration: '2s' }}
                />
                <Sparkles className="w-4 h-4 text-accent absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h3 className="text-xl font-medium mb-2">
                Searching Similar Documents
              </h3>
              <p className="text-secondary mb-6">
                Comparing your document with others on the blockchain
              </p>
            </div>

            {/* Skeleton loading state */}
            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-6 w-[200px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-[80%] mb-4" />
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <Hash className="w-4 h-4 mr-1 text-accent/50" />
                        <Skeleton className="h-4 w-[120px]" />
                      </div>
                      <div className="flex items-center">
                        <Link className="w-4 h-4 mr-1 text-accent/50" />
                        <Skeleton className="h-4 w-[80px]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stage 3: Similar Documents Results */}
        {!isProcessing &&
          !isLoadingSimilar &&
          analysisResult &&
          !showBlockchainStage && (
            <div className="flex flex-col h-full">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 relative">
                  <Link className="w-8 h-8 text-accent" />
                  <Sparkles className="w-4 h-4 text-accent absolute -top-1 -right-1 animate-pulse" />
                </div>
                <h3 className="text-xl font-medium mb-2">
                  {similarDocuments.length > 0
                    ? 'Similar Documents Found'
                    : 'No Similar Documents Found'}
                </h3>
                <p className="text-secondary mb-6">
                  {similarDocuments.length > 0
                    ? `We found ${similarDocuments.length} similar documents on the blockchain`
                    : 'Your document appears to be unique on the blockchain'}
                </p>
              </div>

              {similarDocuments.length > 0 && (
                <div className="flex-1 overflow-auto">
                  <div className="grid grid-cols-1 gap-4">
                    {similarDocuments.map((doc, index) => {
                      const metadata = JSON.parse(doc.metadata);
                      return (
                        <Popover key={index}>
                          <PopoverTrigger asChild>
                            <div className="bg-muted/30 p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">
                                  {metadata.title}
                                </h4>
                                <span className="text-xs text-secondary">
                                  {new Date(
                                    metadata.submissionTimestamp
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-secondary mb-2">
                                {doc.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center">
                                  <Hash className="w-4 h-4 mr-1 text-accent" />
                                  <span className="text-secondary">Hash:</span>
                                  <code className="ml-1 bg-muted px-2 py-0.5 rounded">
                                    {doc.hash
                                      ? doc.hash.slice(0, 8) + '...'
                                      : 'N/A'}
                                  </code>
                                </div>
                                <div className="flex items-center">
                                  <Link className="w-4 h-4 mr-1 text-accent" />
                                  <span className="text-secondary">
                                    Tokens:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {metadata.tokenCount}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px]">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-lg">
                                  Document Details
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  This document is stored securely on the
                                  blockchain. Add your document to get detailed
                                  similarity insights and protection features.
                                </p>
                              </div>
                              <div className="space-y-2">
                                <h5 className="font-medium">
                                  Similarity Score
                                </h5>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-colors ${
                                      doc.similarity >= 0.8
                                        ? 'bg-red-600'
                                        : doc.similarity >= 0.5
                                          ? 'bg-amber-500'
                                          : 'bg-emerald-600'
                                    }`}
                                    style={{
                                      width: `${doc.similarity * 100}%`,
                                    }}
                                  />
                                </div>
                                <p
                                  className={`text-sm font-medium ${
                                    doc.similarity >= 0.8
                                      ? 'text-red-600'
                                      : doc.similarity >= 0.5
                                        ? 'text-amber-600'
                                        : 'text-emerald-600'
                                  }`}
                                >
                                  {(doc.similarity * 100).toFixed(1)}% similar
                                </p>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      );
                    })}
                  </div>
                </div>
              )}

              <BlockchainCTA
                className="mt-8"
                documentHash={analysisResult.documentHash}
                onAddToBlockchain={() => {
                  setShowBlockchainStage(true);
                  toast.success('Starting blockchain integration...', {
                    description:
                      'Your document will be securely added to the blockchain.',
                  });
                }}
              />
            </div>
          )}

        {/* Stage 4: Blockchain Upload */}
        {!isProcessing &&
          !isLoadingSimilar &&
          analysisResult &&
          showBlockchainStage && (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBlockchainStage(false)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h3 className="text-xl font-medium">Add to Blockchain</h3>
                </div>
              </div>

              <form onSubmit={handleBlockchainSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">URL *</Label>
                    <Input
                      id="url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      readOnly
                      className="bg-muted/50"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading || !title || !url}
                  >
                    {isLoading
                      ? 'Adding to Blockchain...'
                      : 'Add to Blockchain'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBlockchainStage(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

        {error && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-medium text-red-600 mb-2">
              Upload Failed
            </h3>
            <p className="text-secondary">{error}</p>
          </div>
        )}

        {!isProcessing && !analysisResult && !error && !isLoadingSimilar && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <Upload className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-medium mb-3">
              Upload Document for Analysis
            </h3>
            <p className="text-secondary mb-8 max-w-md text-center">
              Drag and drop your file ({SUPPORTED_FILE_TYPES.join(', ')}) or
              click to browse. We&apos;ll analyse it for similarity with
              existing documents on the blockchain.
            </p>
            <div
              className="border-2 border-dashed rounded-lg p-12 text-center transition-colors border-border hover:border-accent hover:bg-accent/5 cursor-pointer"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleFileSelect}
            >
              <Button size="lg" className="gap-2">
                Choose File
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
