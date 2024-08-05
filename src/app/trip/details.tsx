import {Alert, FlatList, Text, View} from "react-native";
import React, {useEffect, useState} from "react";
import {Link, linksServer} from "@/server/link-server";
import {Participant, participantsServer} from "@/server/participants-server";
import {Button} from "@/components/button";
import {colors} from "@/styles/colors";
import {Modal} from "@/components/modal";
import {Input} from "@/components/input";
import {validateInput} from "@/utils/validateInput";
import {TripLink} from "@/components/tripLink";
import {TripParticipant } from "@/components/tripParticipant";
import {ArrowRight, AtSign, Edit2, Plus, TableRowsSplit, Trash2, UserRoundPlus} from "lucide-react-native";
import Loading from "@/components/loading";
import {GuestData} from "@/components/email";
import {tripServer} from "@/server/trip-server";

enum ModalEnum {
    NEW_LINK =0,
    EDIT_LINK=1,
    NONE=2,
    GUESTS = 3  
}

export function Details({tripId} : {tripId:string}) {
    
    
    const [showLinkModal, setShowLinkModal] = useState(ModalEnum.NONE);
    
    const [links, setLinks] = useState<Link[]>([]);
    const [linkTitle, setLinkTitle] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [linkId, setLinkId] = useState("");
    
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    
    
    const [isCreatingOrEditingLink, setIsCreatingOrEditingLink] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    async function getLinks() {
        try {
            setIsLoading(true);
            const links = await linksServer.getByTripId(tripId);
            if (links) {
                setLinks(links);
            } else {
                Alert.alert("Links", "Erro ao carregar os links da viagem");
            }
        } catch (error) {
          throw error;
        } finally {
            setIsLoading(false);
        }
    }
    
    async function getParticipants() {
        try {
          setIsLoading(true);
          const participants = await participantsServer.getByTripId(tripId);
          if (participants) {
              // Sort participants by isConfirmed status, confirmed participants first
              const sortedParticipants = participants.sort((a, b) => {
                  if (a.isConfirmed && !b.isConfirmed) return -1;
                  if (!a.isConfirmed && b.isConfirmed) return 1;
                  return 0;
              });
              setParticipants(sortedParticipants);
          } else {
              Alert.alert("Participantes", "Erro ao carregar os participantes da viagem");
          }
        } catch (error) {
          throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCreateLink() {
        try {
            if (!linkTitle.trim()) {
                return Alert.alert("Link", "Informe um título para o link");
            }
            if (!validateInput.url(linkUrl.trim())) {
                return Alert.alert("Link", "Link inválido");
            }

            setIsCreatingOrEditingLink(true);

            await linksServer.create({tripId, title: linkTitle, url: linkUrl});
            Alert.alert("Link", "Link criado com sucesso!");
            setLinkTitle(""); setLinkUrl(""); setShowLinkModal(ModalEnum.NONE)
            await getLinks();
        } catch (error) {
            console.log(error)
            throw error;
        } finally {
            setIsCreatingOrEditingLink(false);
        }
    }

    function handleEditLink(id: string) {
        setShowLinkModal(ModalEnum.EDIT_LINK);
        const linkToEdit = links.find(l => l.id === id);
        if (!linkToEdit) {
            return Alert.alert("Link não encontrado", "O link a ser editado não está mais disponível");
        }
        setLinkTitle(linkToEdit.title); setLinkUrl(linkToEdit.url); setLinkId(id);
    }

    async function handleUpdateLink() {
        try {
            if (!linkTitle.trim()) {
                return Alert.alert("Link", "Informe um título para o link");
            }
            if (!validateInput.url(linkUrl.trim())) {
                return Alert.alert("Link", "Link inválido");
            }

            setIsCreatingOrEditingLink(true);

            await linksServer.update({tripId: tripId, id: linkId, title: linkTitle, url: linkUrl});
            Alert.alert("Link", "Link atualizado com sucesso!");
            setLinkTitle("");
            setLinkUrl("");
            setLinkId("");
            setShowLinkModal(ModalEnum.NONE);
            await getLinks();
        } catch (error) {
            console.log(error)
            throw error;
        } finally {
            setIsCreatingOrEditingLink(false);
        }
    }

    function confirmLinkDeletion() {
        return Alert.alert(
            "Deletar o link da viagem",
            `Tem certeza que quer deletar o link "${linkTitle}"?`,
            [
                {text: "Não",style: "cancel"},
                {text: "Sim",onPress: () => handleDeleteLink()}
            ]
        );
    }

    async function handleDeleteLink() {
        try {
            setIsCreatingOrEditingLink(true);

            await linksServer.deleteLink({tripId: tripId, id: linkId});
            Alert.alert("Link", "Link deletado com sucesso!");
            setLinkTitle("");
            setLinkUrl("");
            setLinkId("");
            await getLinks();
            setShowLinkModal(ModalEnum.NONE);
        } catch (error) {
            console.log(error)
            throw error;
        } finally {

            setIsCreatingOrEditingLink(false);
        }
    }

    async function handleAddParticipant({guestName, guestEmail}: { guestName: string, guestEmail: string }) {
        if (guestName.trim() === "" || guestEmail.trim() === "") {
            return Alert.alert("Convidado", "Insira todos campos")
        }
        if (!validateInput.email(guestEmail)) {
            return Alert.alert("Convidado", "E-mail inválido")
        }
        if (participants.find(g => g.email.trim() === guestEmail.trim())) {
            return Alert.alert("Convidado", "Esse e-mail já foi adicionado")
        }
        try {
            setIsLoading(true);
            await participantsServer.create({
                tripId,
                name: guestName,
                email: guestEmail
            })

            Alert.alert("Convidado", "Participante convidado!")
            setShowLinkModal(ModalEnum.NONE); setGuestName("");setGuestEmail("");
            await getParticipants();
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            setIsLoading(false)
        }
    }

    function confirmParticipantVerify(id: string, name:string) {
        return Alert.alert(
            "Confirmar participante na viagem",
            `Quer confirmar o participante ${name} nessa viagem?`,
            [
                {text: "Não",style: "cancel"},
                {text: "Sim",onPress: () => handleConfirmParticipant(id)}
            ]
        );
    }

    async function handleConfirmParticipant(id: string) {
        try {
            setIsLoading(true);

            await participantsServer.confirmTripByParticipantId({tripId: tripId, id: id});
            Alert.alert("Convidados", "Participante confirmado!");
            await getParticipants();
        } catch (error) {
            console.log(error)
            throw error;
        } finally {
            setIsLoading(false);
        }
    }
    
    useEffect(() => {
        getParticipants();
        getLinks();
    }, []);


    return (
        <View className="flex-1 mt-10">
            <View className="flex-1">
                <Text className="text-zinc-50 text-4xl py-3 px-1 font-sacramento mx-2">Links importantes:</Text>
                {isLoading && <Loading/>}
                <View className="h-1/2">
                {links.length > 0 ? (
                        <FlatList
                            data={links}
                            keyExtractor={item => item.id}
                            renderItem={({item}) => <TripLink data={item} handleEditLink={() => handleEditLink(item.id)}/>}
                            contentContainerClassName="gap-4 pb-4"
                        /> ) :
                        (
                            !isLoading && (<Text className="text-zinc-50 font-sacramento text-3xl m-2 p-2">Não existem links cadastrados...</Text>)
                        )}
                </View>

                <Button className="mt-10" variant="secondary" onPress={() => setShowLinkModal(ModalEnum.NEW_LINK)}>
                    <Plus color={colors.zinc[200]} size={20}></Plus>
                    <Button.Title>Cadastrar novo link</Button.Title>
                </Button>
            </View>

            <View className="flex-1 border-t border-zinc-800 -mt-10">
                <Text className="text-zinc-50 text-4xl font-sacramento py-4">Convidados:</Text>
                {isLoading && <Loading/>}
                <View className="h-1/2">
                    {participants.length > 0 ? (
                            <FlatList
                                data={participants}
                                keyExtractor={item => item.id}
                                renderItem={({item}) => <TripParticipant data={item} handleConfirmParticipant={() => confirmParticipantVerify(item.id, item.name)}/>}
                                contentContainerClassName="gap-4 pb-4 mb-5"
                            /> ) :
                        (
                            !isLoading && (<Text className="text-zinc-50 font-sacramento text-3xl m-2 p-2">Não existem participantes cadastrados...</Text>)
                        )}
                </View>
                <View className="flex-1">
                    <Button className="" variant="primary" onPress={() => setShowLinkModal(ModalEnum.GUESTS)}>
                        <UserRoundPlus color={colors.zinc[950]} size={20}/>
                        <Button.Title>Convidar participante</Button.Title>
                    </Button>
                </View>

            </View>
            
            <Modal
                title="Cadastrar link"
                subtitle="Todos convidados podem visualizar os links importantes."
                visible={showLinkModal === ModalEnum.NEW_LINK}
                onClose={() => setShowLinkModal(ModalEnum.NONE)}
            >
                <View className="gap-2 mb-3">
                    <Input variant="secondary">
                        <Input.Field
                            placeholder="Título do Link"
                            onChangeText={setLinkTitle}
                        />
                    </Input>
                    <Input variant="secondary">
                        <Input.Field
                            placeholder="URL"
                            onChangeText={setLinkUrl}
                        />
                    </Input>
                </View>
                <Button isLoading={isCreatingOrEditingLink} onPress={handleCreateLink}>
                    <Button.Title>Salvar link</Button.Title>
                </Button>
            </Modal>

            <Modal
                title="Editar link"
                subtitle="Edite ou apague o link dessa viagem"
                visible={showLinkModal === ModalEnum.EDIT_LINK}
                onClose={() => {
                    setShowLinkModal(ModalEnum.NONE);
                    setLinkId("");
                }}
            >
                <View className="gap-2 mb-3">
                    <Input variant="secondary">
                        <Input.Field
                            placeholder="Título do Link"
                            onChangeText={setLinkTitle}
                            value={linkTitle}
                        />
                    </Input>
                    <Input variant="secondary">
                        <Input.Field
                            placeholder="URL"
                            onChangeText={setLinkUrl}
                            value={linkUrl}
                        />
                    </Input>
                </View>
                <View className="gap-2 mb-3">
                    <Button isLoading={isCreatingOrEditingLink} onPress={handleUpdateLink}>
                        <Edit2 color={colors.zinc[950]} size={20}></Edit2>
                        <Button.Title>Salvar edição</Button.Title>
                    </Button>
                    <Button variant="delete" isLoading={isCreatingOrEditingLink} onPress={confirmLinkDeletion}>
                        <Trash2 color={colors.zinc[950]} size={20}></Trash2>
                        <Button.Title>Deletar link</Button.Title>
                    </Button>
                </View>
            </Modal>
            
            <Modal
                title="Convidar participantes"
                subtitle="Adicione particiipantes à sua viagem."
                visible={showLinkModal === ModalEnum.GUESTS}
                onClose={() => setShowLinkModal(ModalEnum.NONE)}
            >
                <View className="gap-4 mt-4">
                    <Input variant="secondary">
                        <UserRoundPlus color={colors.zinc[400]} size={20}></UserRoundPlus>
                        <Input.Field
                            placeholder="Digite o nome do convidado"
                            keyboardType="email-address"
                            onChangeText={setGuestName}
                            value={guestName}
                            autoCorrect={false}
                        ></Input.Field>
                    </Input>
                    <Input variant="secondary">
                        <AtSign color={colors.zinc[400]} size={20}></AtSign>
                        <Input.Field
                            placeholder="Digite o email do convidado"
                            keyboardType="email-address"
                            onChangeText={(text) => setGuestEmail(text.toLowerCase())}
                            value={guestEmail}
                            autoCorrect={false}
                        ></Input.Field>
                    </Input>
                    <Button onPress={() => handleAddParticipant({guestName, guestEmail})} variant="secondary" isLoading={isLoading}>
                        <Button.Title>Adicionar</Button.Title>
                        <Plus color={colors.zinc[400]} size={20}></Plus>
                    </Button>
                </View>
            </Modal>
            
        </View>
    )
}