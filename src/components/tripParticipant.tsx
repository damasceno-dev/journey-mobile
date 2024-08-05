import {Text, TouchableOpacity, View} from "react-native"
import {CircleDashed, CircleCheck, Edit, ThumbsUp} from "lucide-react-native"

import { colors } from "@/styles/colors"
import {Participant} from "@/server/participants-server";


type Props = {
    data: Participant,
    handleConfirmParticipant: () => void;
}

export function TripParticipant({ data, handleConfirmParticipant }: Props) {
    return (
        <View className="w-full flex-row items-center gap-4">
            <View className="flex-1">
                <Text className="text-zinc-100 text-base font-semibold">
                    {data.name ?? "Pendente"}
                </Text>

                <Text className="text-zinc-400 text-sm">{data.email}</Text>
            </View>

            {data.isConfirmed ? (
                <CircleCheck color={colors.lime[300]} size={20} />
            ) : (
                <>
                <TouchableOpacity activeOpacity={0.7} onPress={handleConfirmParticipant}>
                    <ThumbsUp color={colors.zinc[400]} size={20}/>
                </TouchableOpacity>
                <CircleDashed color={colors.zinc[400]} size={20} />
                </>
            )}
        </View>
    )
}