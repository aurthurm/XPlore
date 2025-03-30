import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 h-screen max-h-screen rounded-none">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <span className="text-primary-600 text-2xl">
                <i className="fas fa-map-marked-alt"></i>
              </span>
              <span className="font-montserrat font-bold text-xl">ZimExplore</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="flex flex-col p-4 space-y-4">
              <Link href="/" onClick={onClose} className="text-lg font-medium p-2 hover:bg-slate-100 rounded-md">
                Home
              </Link>
              <Link href="#" onClick={onClose} className="text-lg font-medium p-2 hover:bg-slate-100 rounded-md">
                About
              </Link>
              <Link href="#" onClick={onClose} className="text-lg font-medium p-2 hover:bg-slate-100 rounded-md">
                Contact
              </Link>
              <Link href="/dashboard" onClick={onClose} className="text-lg font-medium p-2 hover:bg-slate-100 rounded-md">
                Business Dashboard
              </Link>
            </div>
          </div>

          <div className="p-4 border-t">
            <Link href="/dashboard" onClick={onClose}>
              <Button className="w-full">
                <i className="fas fa-user-tie mr-2"></i>
                Business Login
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileMenu;
