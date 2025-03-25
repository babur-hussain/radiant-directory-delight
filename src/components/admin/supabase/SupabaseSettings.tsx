
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExternalLink, Settings, Database, Shield, Save, RefreshCw, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SupabaseSettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ connected: boolean; error?: string } | null>(null);
  const { toast } = useToast();
  
  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate saving settings
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully.",
      });
    }, 1000);
  };
  
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const { data, error } = await supabase.from('subscription_packages').select('count').limit(1);
      
      if (error) throw error;
      
      setConnectionStatus({ connected: true });
      toast({
        title: "Connection Successful",
        description: "Successfully connected to Supabase database.",
      });
    } catch (error) {
      console.error("Supabase connection error:", error);
      setConnectionStatus({ 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown connection error' 
      });
      
      toast({
        title: "Connection Failed",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  const openSupabaseLink = (path: string) => {
    const projectId = 'kyjdfhajtdqhdoijzmgk'; // Get this from env or configuration
    window.open(`https://supabase.com/dashboard/project/${projectId}${path}`, '_blank');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Supabase Settings</h2>
        <Button 
          variant="default" 
          onClick={handleSaveSettings} 
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
      
      <Tabs defaultValue="connection" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supabase Connection</CardTitle>
              <CardDescription>
                Manage your Supabase project connection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <Label htmlFor="supabase-url">Supabase URL</Label>
                  <Input 
                    id="supabase-url" 
                    value="https://kyjdfhajtdqhdoijzmgk.supabase.co" 
                    disabled 
                  />
                </div>
                
                <div>
                  <Label>&nbsp;</Label>
                  <Button 
                    className="w-full mt-[6px]"
                    variant="outline"
                    onClick={() => openSupabaseLink('')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="anon-key">Anon Key (masked)</Label>
                <Input 
                  id="anon-key" 
                  value="•••••••••••••••••••••••••••••••••••••••••••••••••" 
                  disabled 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service-role-key">Service Role Key (masked)</Label>
                <Input 
                  id="service-role-key" 
                  value="•••••••••••••••••••••••••••••••••••••••••••••••••" 
                  disabled 
                />
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
              
              {connectionStatus && (
                <Alert variant={connectionStatus.connected ? "default" : "destructive"}>
                  {connectionStatus.connected ? (
                    <>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Connection Successful</AlertTitle>
                      <AlertDescription>
                        Successfully connected to the Supabase database.
                      </AlertDescription>
                    </>
                  ) : (
                    <>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Connection Failed</AlertTitle>
                      <AlertDescription>
                        {connectionStatus.error || 'Could not connect to Supabase'}
                      </AlertDescription>
                    </>
                  )}
                </Alert>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Environment Settings</CardTitle>
              <CardDescription>
                Configure environment-specific settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="debug-mode" />
                <Label htmlFor="debug-mode">Debug Mode</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="development-mode" defaultChecked />
                <Label htmlFor="development-mode">Development Environment</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-id">Project ID</Label>
                <Input 
                  id="project-id" 
                  value="kyjdfhajtdqhdoijzmgk" 
                  disabled 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Settings</CardTitle>
              <CardDescription>
                Configure database connection and performance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-connections">Max Connections</Label>
                  <Input 
                    id="max-connections" 
                    type="number" 
                    defaultValue="10" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeout">Connection Timeout (ms)</Label>
                  <Input 
                    id="timeout" 
                    type="number" 
                    defaultValue="5000" 
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="auto-migrate" />
                <Label htmlFor="auto-migrate">Auto Migrate Schema</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="lazy-loading" defaultChecked />
                <Label htmlFor="lazy-loading">Lazy Loading</Label>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Button 
                  variant="outline" 
                  onClick={() => openSupabaseLink('/database/tables')}
                >
                  Database Tables
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => openSupabaseLink('/sql/new')}
                >
                  SQL Editor
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Backup Settings</CardTitle>
              <CardDescription>
                Configure database backup settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch id="automatic-backups" defaultChecked />
                <Label htmlFor="automatic-backups">Automatic Backups</Label>
              </div>
              
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Backups are managed through the Supabase Dashboard.
                <div className="mt-2">
                  <Button 
                    variant="link" 
                    onClick={() => openSupabaseLink('/project-settings/backups')}
                    className="text-primary"
                  >
                    Manage Backups in Supabase
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>
                Configure authentication providers and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    Email Auth
                    <Switch defaultChecked />
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    Google
                    <Switch />
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    Facebook
                    <Switch />
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    Twitter
                    <Switch />
                  </Label>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-4">
                <Switch id="email-confirmation" defaultChecked />
                <Label htmlFor="email-confirmation">Require Email Confirmation</Label>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => openSupabaseLink('/auth/users')}
                >
                  Manage Users
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => openSupabaseLink('/auth/providers')}
                >
                  Auth Providers
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Row Level Security</CardTitle>
              <CardDescription>
                Configure row level security policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Row Level Security is managed through the Supabase Dashboard or SQL commands.
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => openSupabaseLink('/database/tables')}
                  >
                    Manage RLS Policies
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => openSupabaseLink('/sql/new')}
                  >
                    Write RLS SQL
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage</CardTitle>
              <CardDescription>
                Configure file storage settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-sm text-muted-foreground">
                Storage is managed through the Supabase Dashboard.
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => openSupabaseLink('/storage/buckets')}
                  >
                    Manage Storage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Edge Functions</CardTitle>
              <CardDescription>
                Manage serverless functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-sm text-muted-foreground">
                Edge Functions are managed through the Supabase Dashboard.
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => openSupabaseLink('/functions')}
                  >
                    Manage Edge Functions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Realtime</CardTitle>
              <CardDescription>
                Configure real-time subscription settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch id="realtime-enabled" defaultChecked />
                <Label htmlFor="realtime-enabled">Enable Realtime</Label>
              </div>
              
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Realtime is managed through the Supabase Dashboard.
                <div className="mt-2">
                  <Button 
                    variant="link" 
                    onClick={() => openSupabaseLink('/project-settings/realtime')}
                    className="text-primary"
                  >
                    Manage Realtime in Supabase
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupabaseSettings;
