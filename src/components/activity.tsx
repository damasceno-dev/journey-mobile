import {Text, TouchableOpacity, TouchableOpacityProps, View} from "react-native"
import { CircleDashed, CircleCheck } from "lucide-react-native"

import { colors } from "@/styles/colors"
import clsx from "clsx"
import {Activity} from "@/server/activities-server";

type Props = TouchableOpacityProps & {
    data: Activity & { hour: string }
}

export function ActivityComp({ data, ...rest }: Props) {
    return (
        <TouchableOpacity activeOpacity={0.6} {...rest} disabled={data.status}>
            <View
                className={clsx(
                    "w-full bg-zinc-900 px-4 py-3 rounded-lg flex-row items-center border border-zinc-800 gap-3",
                    { "opacity-90": data.status }
                )}
            >
                {data.status ? (
                    <CircleCheck color={colors.lime[300]} size={20} />
                ) : (
                    <CircleDashed color={colors.zinc[400]} size={20} />
                )}

                <Text className="text-zinc-100 font-regular text-base flex-1">
                    {data.name}
                </Text>

                <Text className="text-zinc-400 font-regular text-sm">{data.hour}</Text>
            </View>
        </TouchableOpacity>
        
    )
}