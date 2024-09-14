const localization_timezone_name = {
    default: 'timezone',
    localization: {
        fr: 'fuseau_horaire',
        'es-ES': 'zona_horaria',
        'pt-BR': 'fuso_horário',
        it: 'fuso_orario'
    }
};

const localization_calendar_list_description = {
    default: 'List upcoming streams.',
    localization: {
        fr: 'Voir les futurs streams.',
        'es-ES': 'Ver los streams.',
        'pt-BR': 'Visualizar streams futuros.',
        it: 'Elenca gli stream in programma.'
    }
};

const localization_text_no_streams_public = {
    default: 'No streams are scheduled yet.',
    localization: {
        fr: "Aucun stream n'est prévu.",
        'es-ES': 'No hay streams programadas aún.',
        'pt-BR': 'Nenhum stream está agendado ainda.',
        it: 'Nessuno stream è ancora programmato.'
    }
};

const localization_text_not_connected_public = {
    default: 'No Twitch channel has been connected to this server.',
    localization: {
        fr: "Aucune chaîne Twitch n'est configurée pour ce serveur.",
        'es-ES': 'Ningún canal de Twitch ha sido conectado a este servidor.',
        'pt-BR': 'Nenhum canal do Twitch foi conectado a este servidor.',
        it: 'Nessun canale Twitch è stato collegato a questo server.'
    }
};

const localizations = {
    COMMAND_SCHEDULE: {
        name: {
            default: 'schedule',
            localization: {
                fr: 'programme',
                'es-ES': 'cronograma',
                'pt-BR': 'programação',
                it: 'programazione'
            }
        },
        description: localization_calendar_list_description
    },
    COMMAND_CALENDAR: {
        name: {
            default: 'calendar',
            localization: {
                fr: 'calendrier',
                'es-ES': 'calendario',
                'pt-BR': 'calendário',
                it: 'calendario'
            }
        },
        description: {
            default: 'Manage Twitch calendar of the channel.',
            localization: {
                fr: 'Gérer le calendrier Twitch de la chaîne.',
                'es-ES': 'Gestiona el calendario del canal Twitch.',
                'pt-BR': 'Gerencie o calendário do canal Twitch',
                it: 'Gestisci il calendario del canale Twitch.'
            }
        }
    },
    COMMAND_CALENDAR_CREATE: {
        name: {
            default: 'create',
            localization: {
                fr: 'créer',
                'es-ES': 'crear',
                'pt-BR': 'criar',
                it: 'crea'
            }
        },
        description: {
            default: 'Create a stream within the calendar.',
            localization: {
                fr: 'Créer un stream dans le calendrier.',
                'es-ES': 'Crea un stream dentro del calendario.',
                'pt-BR': 'Crie um stream dentro do calendário.',
                it: 'Crea uno stream nel calendario.'
            }
        }
    },
    COMMAND_CALENDAR_EDIT: {
        name: {
            default: 'edit',
            localization: {
                fr: 'modifier',
                'es-ES': 'editar',
                'pt-BR': 'editar',
                it: 'modifica'
            }
        },
        description: {
            default: 'Edit an upcoming stream.',
            localization: {
                fr: 'Modifier un futur stream.',
                'es-ES': 'Edita un stream.',
                'pt-BR': 'Edite um stream futura.',
                it: 'Modifica uno stream in programma.'
            }
        }
    },
    COMMAND_CALENDAR_DELETE: {
        name: {
            default: 'delete',
            localization: {
                fr: 'supprimer',
                'es-ES': 'eliminar',
                'pt-BR': 'excluir',
                it: 'elimina'
            }
        },
        description: {
            default: 'Delete an upcoming stream.',
            localization: {
                fr: 'Supprimer un stream prévu.',
                'es-ES': 'Elimina un stream.',
                'pt-BR': 'Exclua um stream futura.',
                it: 'Elimina uno stream in programma.'
            }
        }
    },
    COMMAND_CALENDAR_LIST: {
        name: {
            default: 'list',
            localization: {
                fr: 'lister',
                'es-ES': 'listar',
                'pt-BR': 'listar',
                it: 'elenco'
            }
        },
        description: localization_calendar_list_description
    },
    COMMAND_CALENDAR_TIMEZONE: {
        name: localization_timezone_name,
        description: {
            default: 'Default calendar timezone for future streams.',
            localization: {
                fr: 'Fuseau horaire par défaut du calendrier pour les futurs streams',
                'es-ES': 'Zona horaria de calendario predeterminada para los futuros streams.',
                'pt-BR': 'Fuso horário de calendário padrão para os futuros streams.',
                it: 'Fuso orario del calendario predefinito per i futuri streams.'
            }
        }
    },
    OPTION_STREAM_TITLE: {
        name: {
            default: 'title',
            localization: {
                fr: 'titre',
                'es-ES': 'título',
                'pt-BR': 'título',
                it: 'titolo'
            }
        },
        description: {
            default: "Stream's title.",
            localization: {
                fr: 'Titre du stream.',
                'es-ES': 'Título del stream.',
                'pt-BR': 'Título do stream.',
                it: 'Titolo dello stream.'
            }
        }
    },
    OPTION_STREAM_GAME: {
        name: {
            default: 'game',
            localization: {
                fr: 'jeu',
                'es-ES': 'juego',
                'pt-BR': 'jogo',
                it: 'gioco'
            }
        },
        description: {
            default: 'Planned game.',
            localization: {
                fr: 'Jeu prévu.',
                'es-ES': 'Juego planeado.',
                'pt-BR': 'Jogo planejado.',
                it: 'Gioco pianificato.'
            }
        }
    },
    OPTION_STREAM_DATE: {
        name: {
            default: 'date',
            localization: {
                fr: 'date',
                'es-ES': 'fecha',
                'pt-BR': 'data',
                it: 'data'
            }
        },
        description: {
            default: "Stream's date.",
            localization: {
                fr: 'Date du stream.',
                'es-ES': 'Fecha del stream.',
                'pt-BR': 'Data do stream.',
                it: 'Data dello stream.'
            }
        }
    },
    OPTION_STREAM_TIME: {
        name: {
            default: 'time',
            localization: {
                fr: 'horaire',
                'es-ES': 'hora',
                'pt-BR': 'hora',
                it: 'orario'
            }
        },
        description: {
            default: "Stream's time.",
            localization: {
                fr: 'Heure du stream.',
                'es-ES': 'Hora del stream.',
                'pt-BR': 'Hora do stream.',
                it: 'Orario dello stream.'
            }
        }
    },
    OPTION_STREAM_TIMEZONE: {
        name: localization_timezone_name,
        description: {
            default: 'Time zone you are setting the date and time for.',
            localization: {
                fr: "Fuseau horaire pour la date et l'heure configurée.",
                'es-ES': 'Zona horaria para la que estás configurando la fecha y la hora.',
                'pt-BR': 'Fuso horário para o qual você está configurando a data e a hora.',
                it: "Fuso orario per il quale stai impostando la data e l'orario."
            }
        }
    },
    OPTION_STREAM_NEW_TIMEZONE: {
        name: {
            default: 'new',
            localization: {
                fr: 'nouveau',
                'es-ES': 'nuevo',
                'pt-BR': 'novo',
                it: 'nuovo'
            }
        },
        description: {
            default: 'New default timezone for future streams',
            localization: {
                fr: 'Nouveau fuseau horaire par défaut pour les futurs streams.',
                'es-ES': 'Nuevo huso horario predeterminado para los futuros streams.',
                'pt-BR': 'Novo fuso horário padrão para os futuros streams.',
                it: 'Nuovo fuso orario predefinito per i futuri streams.'
            }
        }
    },
    OPTION_STREAM_DURATION: {
        name: {
            default: 'duration',
            localization: {
                fr: 'durée',
                'es-ES': 'duración',
                'pt-BR': 'duração',
                it: 'durata'
            }
        },
        description: {
            default: 'Durée du stream.',
            localization: {
                fr: "Stream's duration.",
                'es-ES': 'Duración de la transmisión.',
                'pt-BR': 'Duração do stream.',
                it: 'Durata dello stream.'
            }
        }
    },
    OPTION_STREAM_RECURRING: {
        name: {
            default: 'recurring',
            localization: {
                fr: 'récurrent',
                'es-ES': 'recurrente',
                'pt-BR': 'recorrente',
                it: 'ricorrente'
            }
        },
        description: {
            default: 'If stream is recurring.',
            localization: {
                fr: 'Si le stream est récurrent.',
                'es-ES': 'Si el stream es recurrente.',
                'pt-BR': 'Se o stream é recorrente.',
                it: 'Se lo stream è ricorrente.'
            }
        }
    },
    OPTION_STREAM_STREAM: {
        name: { default: 'stream' },
        description: {
            default: 'Target stream.',
            localization: {
                fr: 'Stream visé.',
                'es-ES': 'Stream objetivo.',
                'pt-BR': 'Stream alvo.',
                it: 'Stream di destinazione.'
            }
        }
    },
    OPTION_STREAM_CANCELLED: {
        name: {
            default: 'cancelled',
            localization: {
                fr: 'annulé',
                'es-ES': 'cancelado',
                'pt-BR': 'cancelado',
                it: 'annullato'
            }
        },
        description: {
            default: 'Is the stream cancelled?',
            localization: {
                fr: 'Le stream est-il annulé ?',
                'es-ES': '¿Está la transmisión cancelada?',
                'pt-BR': 'O stream está cancelado?',
                it: 'Lo stream è stato annullato?'
            }
        }
    },
    OPTION_STREAM_EPHEMERAL: {
        name: {
            default: 'ephemeral',
            localization: {
                fr: 'éphémère',
                'es-ES': 'efímero',
                'pt-BR': 'efêmera',
                it: 'effimero'
            }
        },
        description: {
            default: 'Answer with an ephemeral message. Defaults to an ephemeral message.',
            localization: {
                fr: 'Répondre avec un message éphémère. Défaut pour un message éphémère.',
                'es-ES': 'Responde con un mensaje efímero. Por defecto, es un mensaje efímero.',
                'pt-BR': 'Responder com uma mensagem efêmera. Por padrão, uma mensagem efêmera.',
                it: 'Rispondi con un messaggio effimero. Di default, risponde con un messaggio effimero.'
            }
        }
    },
    TEXT_NOT_CONNECTED: {
        default: `${localization_text_not_connected_public.default} Please first [connect your channel](<$url>).`,
        localization: {
            fr: `${localization_text_not_connected_public.localization.fr} Veuillez d'abord [connecter votre chaîne](<$url>).`,
            'es-ES': `${localization_text_not_connected_public.localization['es-ES']} Primero, [conecta tu canal](<$url>).`,
            'pt-BR': `${localization_text_not_connected_public.localization['pt-BR']} Por favor, [conecte seu canal](<$url>) primeiro.`,
            it: `${localization_text_not_connected_public.localization.it} Prima [collega il tuo canale](<$url>).`
        }
    },
    TEXT_NOT_CONNECTED_PUBLIC: localization_text_not_connected_public,
    TEXT_STREAM_CREATED: {
        default: 'The stream was successfully created.',
        localization: {
            fr: 'Le stream a été créé avec succès.',
            'es-ES': 'El stream se creó con éxito',
            'pt-BR': 'O stream foi criado com sucesso.',
            it: 'Lo stream è stato creato con successo.'
        }
    },
    TEXT_STREAM_EDITED: {
        default: 'The stream was successfully edited.',
        localization: {
            fr: 'Le stream a été modifié avec succès.',
            'es-ES': 'El stream se editó con éxito.',
            'pt-BR': 'O stream foi editado com sucesso.',
            it: 'Lo stream è stato modificato con successo.'
        }
    },
    TEXT_STREAM_DELETED: {
        default: 'The stream was successfully deleted.',
        localization: {
            fr: 'Le stream a été supprimé avec succès.',
            'es-ES': 'El stream se eliminó con éxito.',
            'pt-BR': 'O stream foi excluído com sucesso.',
            it: 'Lo stream è stato eliminato con successo.'
        }
    },
    TEXT_NO_STREAMS: {
        default: `${localization_text_no_streams_public.default} Start by creating one!`,
        localization: {
            fr: `${localization_text_no_streams_public.localization.fr} Créez-en un d'abord !`,
            'es-ES': `${localization_text_no_streams_public.localization['es-ES']} ¡Empieza creando una!`,
            'pt-BR': `${localization_text_no_streams_public.localization['pt-BR']} Comece criando um!`,
            it: `${localization_text_no_streams_public.localization.it} Inizia creando uno!`
        }
    },
    TEXT_NO_STREAMS_PUBLIC: localization_text_no_streams_public,
    TEXT_CURRENT_TIMEZONE: {
        default: 'This server default timezone for future streams is set to %timeZone%.',
        localization: {
            fr: 'Le fuseau horaire par défaut de ce serveur pour les futurs streams est réglé sur %timeZone%.',
            'es-ES': 'La zona horaria predeterminada de este servidor para los futuros streams está configurada como %timeZone%.',
            'pt-BR': 'O fuso horário padrão deste servidor para os futuros streams está definido como %timeZone%.',
            it: 'Il fuso orario predefinito di questo server per i futuri streams è impostato su %timeZone%.'
        }
    },
    TEXT_CHANGED_TIMEZONE: {
        default: 'This server default timezone for future streams was changed to %timeZone%.',
        localization: {
            fr: 'Le fuseau horaire par défaut de ce serveur pour les futurs streams a été changé en %timeZone%.',
            'es-ES': 'La zona horaria predeterminada de este servidor para los futuros streams fue cambiada a %timeZone%.',
            'pt-BR': 'O fuso horário padrão deste servidor para os futuros streams foi alterado para %timeZone%.',
            it: 'Il fuso orario predefinito di questo server per i futuri streams è stato cambiato in %timeZone%.'
        }
    },
    TEXT_ERROR: {
        default: 'An error occurred. Please try again.',
        localization: {
            fr: 'Une erreur est survenue. Veuillez réessayer.',
            'es-ES': 'Ocurrió un error. Por favor, intenta nuevamente.',
            'pt-BR': 'Ocorreu um erro. Por favor, tente novamente.',
            it: 'Si è verificato un errore. Riprova.'
        }
    },
    TEXT_TIME_INCOMPLETE: {
        default: 'Date and time fields come together. Please make sure to use the two (2) to have it working.',
        localization: {
            fr: "Les options de date, horaire et fuseau horaire sont liées. Veuillez vous assurer d'indiquer les deux (2) pour que cela fonctionne.",
            'es-ES': 'Los campos de fecha y hora van juntos. Por favor, asegúrate de usar los dos (2) para que funcione.',
            'pt-BR': 'Os campos de data e hora ser preenchidos. Por favor, certifique-se de usar os dois (2) para que funcione.',
            it: 'I campi data e orario vanno usati insieme. Assicurati di utilizzarli tutti e due (2) per farlo funzionare.'
        }
    },
    LABEL_DATE: {
        default: 'Date:',
        localization: {
            fr: 'Date :',
            'es-ES': 'Fecha:',
            'pt-BR': 'Data:',
            it: 'Data:'
        }
    },
    LABEL_GAME: {
        default: 'Game:',
        localization: {
            fr: 'Jeu :',
            'es-ES': 'Juego:',
            'pt-BR': 'Jogo:',
            it: 'Gioco:'
        }
    },
    TEXT_NONE: {
        default: 'N/A',
        localization: {
            fr: 'Aucun',
            'es-ES': 'Ninguno',
            'pt-BR': 'Nenhum',
            it: 'Nessuno'
        }
    }
};

/**
 * Get a localized date
 * @param {string} dateString - Date string in format YYYY-MM-DDTHH:mm:ss.sss
 * @param {Intl.DateTimeFormatOptions.timeZone} timeZone - Target timezone.
 * @returns
 */
export function localizedDate(dateString, timeZone) {
    const inputDate = new Date(dateString);

    const parts = ['year', 'month', 'day', 'hour', 'minute', 'second'];
    const dateObject = Object.assign(...new Intl.DateTimeFormat('en-US', { ...Object.assign(...parts.map(p => ({ [p]: 'numeric' }))), hour12: false, timeZone }).formatToParts(inputDate).map(part => ({ [part.type]: part.value })));
    const shiftedDate = new Date(Date.UTC(dateObject.year, dateObject.month - 1, dateObject.day, dateObject.hour, dateObject.minute, dateObject.second, inputDate.getMilliseconds()));

    return new Date(inputDate - new Date(shiftedDate - inputDate));
}

/**
 * Get a localized text value.
 * @param {keyof localizations} key - Key for the text.
 * @param {import('discord.js').LocaleString} locale - Locale to get the text for.
 * @returns {string}
 */
export function getLocalizedText(key, locale) {
    return localizations[key]?.localization?.[locale] ?? localizations[key]?.default ?? localizations[key] ?? '';
}

export default localizations;
