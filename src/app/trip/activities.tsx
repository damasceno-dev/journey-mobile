import {Alert, Keyboard, SectionList, Text, View} from "react-native";
import {TripData} from "@/app/trip/[id]";
import {Button} from "@/components/button";
import {ActivityComp} from "@/components/activity";
import {Calendar as IconCalendar, Clock, PlusIcon, Tag} from "lucide-react-native";
import {colors} from "@/styles/colors";
import {Modal} from "@/components/modal";
import {useEffect, useState} from "react";
import {Input} from "@/components/input";
import dayjs from "dayjs";
import {Calendar} from "@/components/calendar";
import {activitiesServer, Activity} from "@/server/activities-server";
import {groupActivitiesByDate} from "@/utils/groupActivities";
import Loading from "@/components/loading";

type Props = {
    tripDetails: TripData;
}

enum ModalEnum {
    NONE=0,
    CALENDAR=1,
    NEW_ACTIVITY=2,
}

export type TripActivities = {
    title: {
        dayNumber: number;
        dayName: string;
    }
    data:(Activity & { hour: string })[]
}


export function Activities({tripDetails} : Props) {
    
    const [isCreatingActivity, setIsCreatingActivity] = useState(false);
    const [isLoadingActivities, setIsLoadingActivities] = useState(false)
    const [showModal, setShowModal] = useState(ModalEnum.NONE);
    const [activityTitle, setActivityTitle] = useState("");
    const [activityDate, setActivityDate] = useState("");
    const [activityHour, setActivityHour] = useState("");
    
    
    const [activities, setActivities] = useState<TripActivities[]|undefined>([])
    async function handleCreateActivity() {
        try {
          if (!activityTitle || !activityHour || !activityDate) {
              return Alert.alert("Cadastrar atividade", "Preencha todos campos");
          }
          
          setIsCreatingActivity(true);
          await activitiesServer.create({
              tripId: tripDetails.id,
              date:dayjs(activityDate).add(Number(activityHour), "h").utc().toISOString(),
              name: activityTitle
          })
            
          Alert.alert("Nova atividade", "Nova atividade cadastrada com sucesso!")
          setActivityDate(""); setActivityHour(""); setActivityTitle("");
          setShowModal(ModalEnum.NONE)
          
          await getActivities();
          
        } catch (error) {
          throw error;
        } finally {
            setIsCreatingActivity(false);
        }   
    }
    
    async function getActivities() {
        setIsLoadingActivities(true)
        try {
            const activities = await activitiesServer.getByTripId(tripDetails.id);
            
            const groupedActivities = groupActivitiesByDate(activities)
            
            const activitiesToSectionList = activities && groupedActivities.map(dayActivity => ({
                title: {
                    dayNumber: dayjs(dayActivity.date).date(),
                    dayName: dayjs(dayActivity.date).format("dddd").replace("-feira", "")
                },
                data: dayActivity.activities.map(activity => ({
                    ...activity,
                    hour: dayjs(activity.date).format("hh[:]mm[h]"),
                }))
            }))
            
            setActivities(activitiesToSectionList)
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            setIsLoadingActivities(false)
        }
    }

    async function handleUpdateActivity(id: string) {
        try {
            setIsLoadingActivities(true);
            await activitiesServer.update(tripDetails.id, id);
            Alert.alert("Atividade atualizada", "Atividade atualizada com sucesso!")
            await getActivities();
        } catch (error) {
            console.log(error)
            throw error;
        } finally {
            setIsLoadingActivities(false)
        }
    }

    function confirmUpdateActivity(id: string, name: string) {
        Alert.alert(
            "Atualizar atividade",
            `Já completou a atividade "${name}"`,
            [
                {
                    onPress: () => {},
                    text: "Não",
                    style: "cancel"
                },
                {
                    text: "Sim",
                    onPress: () => handleUpdateActivity(id)
                }
            ],
            { cancelable: false }
        );
    }
    
    useEffect(() => {
        getActivities();
    }, []);


    return (
        <View className="flex-1">
            <View className="w-full flex-row mt-5 mb-6 items-center">
                <Text className="text-zinc-50 text-2xl font-semibold flex-1">{tripDetails.name}</Text>
                
                <Button onPress={() => setShowModal(ModalEnum.NEW_ACTIVITY)}>
                    <PlusIcon color={colors.lime[950]}></PlusIcon>
                    <Button.Title>Nova atividade</Button.Title>
                </Button>
            
            </View>

            {isLoadingActivities ? 
                (<Loading/>) :
                activities && (
                    <SectionList
                        sections={activities}
                        keyExtractor={item => item.id}
                        renderItem={({item}) => 
                            <ActivityComp 
                                data={item}
                                onPress={() => {confirmUpdateActivity(item.id, item.name)}}
                            />
                        }
                        renderSectionHeader={({section}) => (
                        <View className="w-full">
                            <Text className="text-zinc-50 text-4xl font-sacramento py-2 mt-4">Dia {section.title.dayNumber + " - "}
                                <Text className="text-zinc-50 text-3xl capitalize underline">{section.title.dayName}</Text>
                            </Text>
                        </View>
                    )}
                    />
                )
            }
            
            <Modal
                visible={showModal === ModalEnum.NEW_ACTIVITY}
                onClose={() => setShowModal(ModalEnum.NONE)}
                title="Cadastrar atividade"
                subtitle="Todos convidados podem visualizar as atividades"
            >
                <View className="mt-4 mb-3">
                    <Input variant="secondary">
                        <Tag color={colors.zinc[400]} size={20}></Tag>
                        <Input.Field
                            placeholder="Qual atividade?"
                            onChangeText={setActivityTitle}
                            value={activityTitle}
                        />
                    </Input>
                    
                    <View className="w-full mt-2 flex-row gap-2">
                        <Input variant="secondary" className="flex-1">
                            <IconCalendar color={colors.zinc[400]} size={20}/>
                            <Input.Field
                                placeholder="Data"
                                onChangeText={(text) => setActivityHour(text.replace(".", "").replace(",", ""))}
                                value={activityDate ? dayjs(activityDate).format("DD [de] MMMM"): ""}
                                keyboardType="numeric"
                                maxLength={2}
                                onFocus={() => Keyboard.dismiss()}
                                showSoftInputOnFocus={false}
                                onPress={() =>setShowModal(ModalEnum.CALENDAR)}
                            />
                        </Input>
                        <Input variant="secondary" className="flex-1">
                            <Clock color={colors.zinc[400]} size={20}/>
                            <Input.Field
                                placeholder="Horário?"
                                onChangeText={(text) => setActivityHour(text.replace(".", "").replace(",", ""))}
                                value={activityHour}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                        </Input>
                    </View>
                </View>
                <Button onPress={handleCreateActivity} isLoading={isCreatingActivity}>
                    <Button.Title>Cadastrar atividade</Button.Title>
                </Button>
            </Modal>
            <Modal
                title="Selecione a data"
                subtitle="Selecione a data da atividade"
                visible={showModal === ModalEnum.CALENDAR}
                onClose={() => setShowModal(ModalEnum.NONE)}
            >
                <View className="gap-4 mt-4">
                    <Calendar
                        onDayPress={(day) => setActivityDate(day.dateString)}
                        markedDates={{[activityDate]: {selected: true}}}
                        initialDate={tripDetails.startDate}
                        minDate={tripDetails.startDate}
                        maxDate={tripDetails.endDate}
                    />
                    <Button onPress={() => setShowModal(ModalEnum.NEW_ACTIVITY)}>
                        <Button.Title>Confirmar</Button.Title>
                    </Button>
                </View>
            </Modal>
        </View>
    )
}