import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { ProfileSettings } from "./components/profile-settings";
import { FlowSettings } from "./components/flow-settings";

export default function ConfiguracoesPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as configurações da sua conta e do sistema.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="flows">Fluxos</TabsTrigger>
          {/* Novas abas podem ser adicionadas aqui no futuro */}
        </TabsList>
        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
        <TabsContent value="flows">
          <FlowSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}