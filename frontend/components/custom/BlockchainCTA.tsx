/**
 * @fileoverview Blockchain CTA component that provides a call-to-action for users to secure their documents
 * on the blockchain, featuring a popover with detailed benefits explanation.
 */

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Shield, Lock, Bell, Zap, ChevronRight } from 'lucide-react';

// TODO: Consider adding loading state for blockchain transactions
interface BlockchainCTAProps {
  onAddToBlockchain?: () => void; // TODO: Add loading state and success feedback
  className?: string; // Additional styling classes
  documentHash?: string;
}

const BLOCKCHAIN_BENEFITS = [
  {
    icon: Shield,
    title: 'Document Protection',
    description:
      'Secure your intellectual property with immutable blockchain records',
  },
  {
    icon: Zap,
    title: 'Advanced Analytics',
    description: 'Access detailed similarity metrics and document insights',
  },
  {
    icon: Lock,
    title: 'Verified Ownership',
    description:
      'Establish clear document ownership and timestamp verification',
  },
];

/**
 * Renders a fixed CTA banner promoting blockchain document protection features
 * @param {BlockchainCTAProps} props - Component properties
 * @returns {React.ReactNode} Rendered component
 */
export function BlockchainCTA({
  onAddToBlockchain,
  className,
  documentHash,
}: BlockchainCTAProps): React.ReactNode {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent ${className}`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between bg-card p-4 rounded-lg border shadow-lg">
        {/* Left section with main CTA text */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <h4 className="font-semibold">Enhance Your Document Protection</h4>
            <p className="text-sm text-muted-foreground">
              Add your document to the blockchain for advanced security features
            </p>
          </div>
        </div>

        {/* Popover trigger and content */}
        <Popover>
          <PopoverTrigger asChild>
            <Button className="gap-2">
              Learn More
              <ChevronRight className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-6" align="end">
            <div className="space-y-4">
              <h4 className="font-semibold">RTFL Features</h4>
              <p className="text-sm text-muted-foreground">
                RTFL is a protocol for secure document storage and verification
                on the blockchain.
              </p>
              {/* Benefits grid displaying blockchain advantages */}
              <div className="grid gap-4">
                {BLOCKCHAIN_BENEFITS.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="mt-0.5">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h5 className="font-medium">{benefit.title}</h5>
                        <p className="text-sm text-muted-foreground">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button
                className="w-full mt-4"
                size="lg"
                onClick={onAddToBlockchain}
              >
                Add to Blockchain
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
