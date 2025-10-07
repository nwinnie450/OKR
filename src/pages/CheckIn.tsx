import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CheckIn() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Weekly Check-in</h1>
        <p className="text-muted-foreground">Update progress on your key results</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Progress</CardTitle>
          <CardDescription>Submit your weekly check-in for all assigned key results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">Check-in form coming soon...</p>
            <div className="flex gap-2">
              <Button>Submit Check-in</Button>
              <Button variant="outline">Skip This Week</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
