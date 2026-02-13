"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserAddresses, saveAddress, deleteAddress, setDefaultAddress } from "@/core/services/address-service";
import type { UserAddress } from "@/types/database";

export function useAddresses(userId: string | undefined) {
    const queryClient = useQueryClient();

    const query = useQuery<UserAddress[]>({
        queryKey: ["addresses", userId],
        queryFn: () => fetchUserAddresses(userId!),
        enabled: !!userId,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });

    const addMutation = useMutation({
        mutationFn: saveAddress,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAddress,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
        },
    });

    const setDefaultMutation = useMutation({
        mutationFn: (addressId: string) => setDefaultAddress(userId!, addressId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
        },
    });

    return {
        addresses: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
        addAddress: addMutation.mutateAsync,
        deleteAddress: deleteMutation.mutateAsync,
        setDefaultAddress: setDefaultMutation.mutateAsync,
        isAdding: addMutation.isPending,
    };
}
