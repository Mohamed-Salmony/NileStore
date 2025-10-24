'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Facebook, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productUrl: string;
  productNameEn?: string;
}

export const ShareDialog = ({ isOpen, onClose, productName, productUrl, productNameEn }: ShareDialogProps) => {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);
  
  const displayName = i18n.language === 'en' && productNameEn ? productNameEn : productName;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      toast.success(t('linkCopied') || 'Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(t('failedToCopy') || 'Failed to copy link');
    }
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const text = `${productName}\n${productUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(productName)}`;
    window.open(url, '_blank');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(productName)}&url=${encodeURIComponent(productUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-background rounded-lg shadow-2xl p-6 w-full max-w-md">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{t('shareProduct') || 'مشاركة المنتج'}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Product Name */}
              <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{displayName}</p>

              {/* Copy Link */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">
                  {t('productLink') || 'رابط المنتج'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={productUrl}
                    readOnly
                    className="flex-1 px-4 py-2 border rounded-lg bg-muted text-sm"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        {t('copied') || 'تم النسخ'}
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        {t('copy') || 'نسخ'}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Social Media Buttons */}
              <div className="space-y-3">
                <p className="text-sm font-medium mb-3">
                  {t('shareOn') || 'مشاركة على'}
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={shareToFacebook}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#1877F2] hover:bg-[#1877F2]/90 text-white transition-colors"
                >
                  <Facebook className="h-5 w-5" fill="currentColor" />
                  <span className="font-medium">Facebook</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={shareToWhatsApp}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#25D366] hover:bg-[#25D366]/90 text-white transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">WhatsApp</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={shareToTelegram}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#0088cc] hover:bg-[#0088cc]/90 text-white transition-colors"
                >
                  <Send className="h-5 w-5" />
                  <span className="font-medium">Telegram</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={shareToTwitter}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="font-medium">X (Twitter)</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
