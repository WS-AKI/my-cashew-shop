import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import OrderSuccessContent from "./OrderSuccessContent";

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-amber-50 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-amber-500" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
