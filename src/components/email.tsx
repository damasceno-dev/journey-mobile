import { Text, TouchableOpacity, View } from "react-native"
import { X } from "lucide-react-native"

import { colors } from "@/styles/colors"

type Props = {
    name: string;
    email: string
    onRemove: () => void
}

export function GuestData({ name, email, onRemove }: Props) {
    return (
            <View className="border border-zinc-500 flex flex-row items-center gap-4 rounded p-1">
                <View className="flex flex-col">
                    <Text className="font-bold text-zinc-300 text-base">{name}</Text>
                    <Text className="font-regular text-zinc-300 text-base">{email}</Text>
                </View>
                <TouchableOpacity onPress={onRemove}>
                    <X color={colors.zinc[400]} size={16} />
                </TouchableOpacity>
            </View>
    )
}