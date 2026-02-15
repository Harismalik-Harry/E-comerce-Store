import { Skeleton } from '@/components/ui/skeleton';

export default function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-border/40 overflow-hidden animate-pulse">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-3.5 w-3.5 rounded-full" />
                    ))}
                </div>
                <Skeleton className="h-6 w-20" />
            </div>
        </div>
    );
}
