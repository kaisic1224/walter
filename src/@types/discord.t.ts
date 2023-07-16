import { AudioPlayer, PlayerSubscription } from "@discordjs/voice";
import { Collection } from "discord.js";

declare module "discord.js" {
        export interface Client {
                commands: Collection<any, any>;
                queue: Collection<any, any>;
                player: AudioPlayer;
                subscription: PlayerSubscription | undefined;
        }
}
