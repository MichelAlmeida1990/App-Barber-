'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'lg' }: ModalProps) {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }[maxWidth];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full ${maxWidthClass} max-h-[90vh] transform rounded-lg sm:rounded-2xl bg-white shadow-xl transition-all flex flex-col overflow-hidden`}>
                <Dialog.Title as="div" className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 flex-shrink-0 border-b border-gray-200 pb-3">
                  <h3 className="text-base sm:text-lg font-medium leading-6 text-gray-900 pr-2">
                    {title}
                  </h3>
                  <button
                    type="button"
                    className="flex-shrink-0 rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-1"
                    onClick={onClose}
                  >
                    <span className="sr-only">Fechar</span>
                    <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </button>
                </Dialog.Title>
                <div 
                  className="overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 min-h-0" 
                  style={{ 
                    maxHeight: 'calc(90vh - 120px)',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'thin'
                  }}
                >
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 