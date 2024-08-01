import {Alert, Keyboard, TouchableOpacity, View} from "react-native";
import {router, useLocalSearchParams} from "expo-router";
import React, {useEffect, useState} from "react";
import {TripDetails, tripServer} from "@/server/trip-server";
import Loading from "@/components/loading";
import {Input} from "@/components/input";
import {Calendar as IconCalendar, CalendarRange, Info, MapPin, Settings2} from "lucide-react-native";
import {colors} from "@/styles/colors";
import dayjs from "dayjs";
import {calendarUtils, DatesSelected} from "@/utils/calendarUtils";
import {Button} from "@/components/button";
import {Activities} from "@/app/trip/activities";
import {Details} from "@/app/trip/details";
import {Modal} from "@/components/modal";
import {DateData} from "react-native-calendars";
import {Calendar} from "@/components/calendar";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export type TripData = TripDetails & {
    when: string;
}
enum ModalEnum {
    NONE = 0,
    UPDATE_TRIP = 1,
    CALENDAR = 2,
}
export default function Trip() {
    
    const [isLoadingTrip, setIsLoadingTrip] = useState(true);
    const [isUpdatingTrip, setIsUpdatingTrip] = useState(false);
    
    const [tripDetails, setTripDetails] = useState<TripData>({} as TripData)
    const [option, setOption] = useState<"activity" | "details">("activity")
    const [destination, setDestination] = useState("")
    const [selectedDates, setSelectedDates] = useState({} as DatesSelected)
    
    const {id} = useLocalSearchParams<{id: string}>();
    const tripId = id;
    
    const [showModal, setShowModal] = useState(ModalEnum.NONE)

    function getServerDates(startDate: string, endDate: string) : DatesSelected {

        const startsAt = calendarUtils.convertStringToDateData(startDate);
        const endsAt = calendarUtils.convertStringToDateData(endDate);
        
        return {
            startsAt, endsAt,
            dates: calendarUtils.getIntervalDates(startsAt, endsAt),
            formatDatesInText: calendarUtils.formatDatesInText({startsAt: dayjs(startDate), endsAt: dayjs(endDate)})
        }
    }

    async function getTripDetails() {
      try {
        setIsLoadingTrip(true);
        if (!tripId) {
            Alert.alert("Viagem não encontrada", "O id da viagem não foi encontrado, voltando para página anterior...");
            return router.back();
        }
        
        const trip = await tripServer.getById(tripId);
        const maxLengthDestination = 14
        const destination = trip.name.length > maxLengthDestination ? trip.name.slice(0, maxLengthDestination) + "..." : trip.name;
        
        setTripDetails({
            ...trip, 
            when: `${destination} de ${calendarUtils.formatDatesInText({startsAt: dayjs(trip.startDate),  endsAt: dayjs(trip.endDate)})}`
        });
        setDestination(trip.name);
        setSelectedDates(getServerDates(trip.startDate, trip.endDate));
        
      } catch (error) {
          console.log(error)
        throw error;
      } finally {
        setIsLoadingTrip(false);
      }
    }

    function handleSelectedDate(selectedDay: DateData) {
        const dates = calendarUtils.orderStartsAtAndEndsAt({
            startsAt: selectedDates.startsAt,
            endsAt: selectedDates.endsAt,
            selectedDay
        })
        setSelectedDates(dates);
    }
    
    async function handleUpdateTrip() {
        try {
          if (!tripId) {
              return Alert.alert("Erro", "Erro ao resgatar o id da viagem")
          }
          
          if (!destination || !selectedDates.startsAt || !selectedDates.endsAt) {
              return Alert.alert("Atualizar viagem", "Preencha todos campos para poder atualizar a viagem.")
          }
          
          setIsUpdatingTrip(true);

            const tripToUpdate = {
                id: tripId,
                name: destination,
                startDate: selectedDates.startsAt.dateString,
                endDate: selectedDates.endsAt.dateString
            }
          
          await tripServer.update(tripToUpdate)
          
          Alert.alert("Atualização da viagem", "Viagem atualizada com sucesso!", [
              {text: "OK",
              onPress: () => {
                  setShowModal(ModalEnum.NONE)
                  getTripDetails()
                  }}
          ])  
            
        } catch (error) {
          throw error;
        } finally {
            setIsUpdatingTrip(false);
        }
    }
    
    useEffect(() => {
        getTripDetails();
    }, [])
    
    if(isLoadingTrip) {
        return <Loading/>
    }
    
    return (
        <View className="flex-1 px-5 pt-16">
            <Input variant="tertiary">
                <MapPin color={colors.zinc[400]} size={20}/>
                <Input.Field value={tripDetails.when}></Input.Field>
                <TouchableOpacity
                    onPress={() => setShowModal(ModalEnum.UPDATE_TRIP)}
                    activeOpacity={0.6}
                    className="w-9 h-9 bg-zinc-800 items-center justify-center rounded"
                >
                    <Settings2 color={colors.zinc[400]} size={20}/>
                </TouchableOpacity>
            </Input>

            {option === "activity" ? (
                <Activities tripDetails={tripDetails}/>
            ) : (
                <Details tripId={tripDetails.id}/>
            )}
            
            <View className="w-full absolute -bottom-1 self-center justify-end pb-5 z-10 bg-zinc950">
                <View className="w-full flex-row bg-zinc-900 p-4 rounded-lg border border-zinc-800 gap-2">
                    <Button
                        className="flex-1"
                        onPress={() => setOption("activity")}
                        variant={option === "activity" ? "primary" : "secondary"}
                    >
                        <CalendarRange color={option === "activity" ? colors.lime[950] : colors.zinc[200]}/>
                        <Button.Title>Atividades</Button.Title>
                    </Button>
                    <Button
                        className="flex-1"
                        onPress={() => setOption("details")}
                        variant={option === "details" ? "primary" : "secondary"}
                    >
                        <Info color={option === "details" ? colors.lime[950] : colors.zinc[200]}/>
                        <Button.Title>Detalhes</Button.Title>
                    </Button>
                </View>
            </View>

            <Modal
                title="Atualizar viagem"
                subtitle="Somente quem criou pode editar"
                visible={showModal === ModalEnum.UPDATE_TRIP}
                onClose={() => setShowModal(ModalEnum.NONE)}
            >
                <View className="gap-2 my-4">
                    <Input variant="secondary">
                        <MapPin color={colors.zinc[400]} size={20}/>
                        <Input.Field
                            placeholder="Para onde?"
                            onChangeText={setDestination}
                            value={destination}
                        ></Input.Field>
                    </Input>
                    <Input variant="secondary">
                        <IconCalendar color={colors.zinc[400]} size={20}/>
                        <Input.Field
                            placeholder="Quando?"
                            value={selectedDates.formatDatesInText}
                            onPressIn={() => setShowModal(ModalEnum.CALENDAR)}
                            onFocus={() => Keyboard.dismiss()}
                        ></Input.Field>
                    </Input>
                    <Button onPress={handleUpdateTrip} isLoading={isUpdatingTrip}>
                        <Button.Title>Atualizar</Button.Title>
                    </Button>
                </View>
            </Modal>


            <Modal
                title="Selecionar datas"
                subtitle="Selecione as datas de ida e volta da viagem"
                visible={showModal === ModalEnum.CALENDAR}
                onClose={() => {setShowModal(ModalEnum.NONE)}}
            >
                <View className="gap-4 mt-4">
                    <Calendar
                        onDayPress={handleSelectedDate}
                        markedDates={selectedDates.dates}
                        minDate={dayjs().toISOString()}
                    />
                    <Button onPress={() => setShowModal(ModalEnum.UPDATE_TRIP)}>
                        <Button.Title>Confirmar</Button.Title>
                    </Button>
                </View>
            </Modal>


        </View>
    )
}