import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateObjective, useObjectives } from "@/hooks/useObjectives";
import { useCreateKeyResult } from "@/hooks/useKeyResults";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useDepartments } from "@/hooks/useDepartments";
import { useTeams } from "@/hooks/useTeams";
import { useUsers } from "@/hooks/useUsers";
import {
  Building2,
  Building,
  Users,
  User,
  Target,
  Sparkles,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TemplateSelector } from "@/components/okr/TemplateSelector";
import type { OKRTemplate } from "@/data/okr-templates";

/**
 * ==========================
 * SCHEMA & TYPES
 * ==========================
 */
const METRIC_TYPES = ["number", "percentage", "boolean"] as const;

const keyResultSchema = z
  .object({
    title: z.string().min(5, "Key result title needs at least 5 characters (e.g., 'Launch iOS app in App Store')").max(100, "Keep it under 100 characters"),
    metricType: z.enum(METRIC_TYPES),
    startValue: z.number().min(0, "Starting value cannot be negative"),
    targetValue: z.number().min(0, "Target value cannot be negative"),
    unit: z.string().optional(),
    owner: z.string().min(1, "Please select an owner for this key result"),
  })
  .superRefine((kr, ctx) => {
    // When boolean, we don't require numeric fields; normalize on submit
    if (kr.metricType !== "boolean") {
      if (Number.isNaN(kr.targetValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["targetValue"],
          message: "Target value is required for number/percentage metrics",
        });
      }
    }
  });

const okrSchema = z.object({
  type: z.enum(["company", "department", "team", "individual"]),
  title: z.string().min(5, "Objective title needs at least 5 characters (e.g., 'Launch Mobile App Beta')").max(100, "Keep it concise - under 100 characters"),
  description: z.string().optional(),
  alignTo: z.string().optional(),
  timePeriod: z.string().min(1, "Please select a time period (quarter)"), // e.g. q4-2025
  department: z.string().optional().nullable(), // MUST be an ID if present
  team: z.string().optional().nullable(), // MUST be an ID if present
  context: z.string().optional(),
  relatedTo: z.string().optional(),
  initiatives: z.array(z.string()).optional(),
  keyResults: z
    .array(keyResultSchema)
    .min(2, "Add at least 2 key results to measure success")
    .max(5, "Keep it focused - maximum 5 key results"),
});

export type OKRFormData = z.infer<typeof okrSchema>;

/**
 * ==========================
 * CONSTANTS
 * ==========================
 */
const STEPS = [
  { id: 0, name: "Type", description: "Choose objective type" },
  { id: 1, name: "Template", description: "Choose a template" },
  { id: 2, name: "Objective", description: "Define objective" },
  { id: 3, name: "Key Results", description: "Add key results" },
  { id: 4, name: "Review", description: "Review & publish" },
] as const;

const TIME_PERIODS = [
  { value: "q4-2025", label: "Q4 2025 (Oct 1 - Dec 31)" },
  { value: "q1-2026", label: "Q1 2026 (Jan 1 - Mar 31)" },
  { value: "q2-2026", label: "Q2 2026 (Apr 1 - Jun 30)" },
] as const;

// Removed mock DEFAULT_OWNERS - now using real users from database

/**
 * ==========================
 * HELPERS
 * ==========================
 */
function parseQuarterString(q: string): { timePeriod: "Q1" | "Q2" | "Q3" | "Q4"; year: number } {
  // Supports formats like "q4-2025" or "Q4-2025"
  const [quarterRaw, yearRaw] = q.split("-");
  const quarter = quarterRaw?.toUpperCase() as "Q1" | "Q2" | "Q3" | "Q4";
  const year = Number(yearRaw);
  if (!quarter || !year || !["Q1", "Q2", "Q3", "Q4"].includes(quarter) || Number.isNaN(year)) {
    throw new Error(`Invalid time period: ${q}`);
  }
  return { timePeriod: quarter, year };
}

const isTruthy = (v: unknown): v is string => Boolean(v && String(v).trim());

/**
 * ==========================
 * COMPONENT
 * ==========================
 */
export default function OKRCreation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const createObjective = useCreateObjective();
  const createKeyResult = useCreateKeyResult();
  const [currentStep, setCurrentStep] = useState<number>(0); // Start at step 0 - Type Selection is the FIRST screen

  const { data: departments } = useDepartments();
  const { data: teams } = useTeams();
  const { data: users } = useUsers();
  const { data: objectives } = useObjectives();

  // Memoize lists to prevent re-renders
  const departmentsList = useMemo(() => departments ?? [], [departments]);
  const teamsList = useMemo(() => teams ?? [], [teams]);
  const usersList = useMemo(() => users ?? [], [users]);
  const objectivesList = useMemo(() => objectives ?? [], [objectives]);

  // Normalize roles/permissions robustly
  const roleRaw = (user?.role ?? "").toString().toLowerCase();
  const isAdmin = ["admin", "owner", "superadmin", "super_admin"].includes(roleRaw);
  const isManager = ["manager", "team_lead", "lead"].includes(roleRaw);
  const isManagerOrAdmin = isAdmin || isManager;

  // Determine default OKR type based on user role
  const getDefaultOKRType = (): "company" | "department" | "team" | "individual" => {
    if (isAdmin) return "company";
    if (roleRaw === "manager") return "department";
    if (roleRaw === "team_lead" || roleRaw === "lead") return "team";
    return "individual";
  };

  // Get user's team ID (if they belong to one)
  const userTeamId = useMemo(() => {
    return user?.teamId ?? null;
  }, [user]);

  // Memo: the default team should be user's team or first in list
  const defaultTeamId = useMemo(() => userTeamId || (teamsList[0]?._id ?? null) as string | null, [userTeamId, teamsList]);
  const defaultDepartmentId = useMemo(() => (departmentsList[0]?._id ?? null) as string | null, [departmentsList]);

  const form = useForm<OKRFormData>({
    resolver: zodResolver(okrSchema),
    mode: "onBlur",
    defaultValues: {
      type: getDefaultOKRType(),
      timePeriod: TIME_PERIODS[0].value,
      team: null, // set to valid ID when teams load
      department: null,
      keyResults: [
        {
          title: "",
          metricType: "number",
          startValue: 0,
          targetValue: 100,
          unit: "",
          owner: "", // Will be set when users load
        },
        {
          title: "",
          metricType: "number",
          startValue: 0,
          targetValue: 100,
          unit: "",
          owner: "", // Will be set when users load
        },
      ],
    },
  });

  const { register, control, handleSubmit, watch, setValue, trigger, formState } = form;
  const { errors, isSubmitting } = formState;
  const { fields, append, remove } = useFieldArray({ control, name: "keyResults" });

  const watchType = watch("type");
  const watchKeyResults = watch("keyResults");

  // Ensure we put a REAL team _id by default once teamsList arrives
  useEffect(() => {
    if (!watch("team") && defaultTeamId) {
      setValue("team", defaultTeamId, { shouldTouch: false, shouldDirty: true });
    }
  }, [defaultTeamId, setValue, watch]);

  // Ensure we put a REAL department _id by default once departmentsList arrives
  useEffect(() => {
    const currentDept = watch("department");
    if (!currentDept && defaultDepartmentId) {
      setValue("department", defaultDepartmentId, { shouldTouch: false, shouldDirty: true });
    }
  }, [defaultDepartmentId, setValue, watch]);

  // Set default owner for key results to current logged-in user
  useEffect(() => {
    if (user?.id) {
      const currentKRs = watch("keyResults");
      currentKRs.forEach((kr, index) => {
        if (!kr.owner) {
          setValue(`keyResults.${index}.owner`, user.id, { shouldTouch: false });
        }
      });
    }
  }, [user?.id, setValue, watch]);

  // Auto-save to localStorage
  useEffect(() => {
    const subscription = watch((data) => {
      try {
        localStorage.setItem("okr-draft", JSON.stringify(data));
      } catch (error) {
        // Silently fail if localStorage is unavailable
        console.warn("Failed to save draft to localStorage:", error);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const goNext = async () => {
    // Light step-level validation to reduce server errors later
    if (currentStep === 2) {
      const ok = await trigger(["title", "timePeriod"]);
      if (!ok) return;
    }
    if (currentStep === 3) {
      const ok = await trigger(["keyResults"]);
      if (!ok) return;
    }
    setCurrentStep((s) => Math.min(4, s + 1));
  };

  const goBack = () => setCurrentStep((s) => Math.max(0, s - 1));

  const handleTemplateSelect = (template: OKRTemplate | null) => {
    if (template) {
      setValue("title", template.objective, { shouldDirty: true });
      setValue("description", template.description ?? "", { shouldDirty: true });

      // Default owner to current logged-in user
      const defaultOwnerId = user?.id ?? "";
      const templateKRs = template.keyResults.map((kr) => ({
        title: kr,
        metricType: "number" as const,
        startValue: 0,
        targetValue: 100,
        unit: "",
        owner: defaultOwnerId,
      }));
      setValue("keyResults", templateKRs, { shouldDirty: true });
    }
    // Move to Objective step (step 2) so user can review and modify the pre-filled values
    setCurrentStep(2);
  };

  const handleSkipTemplate = () => setCurrentStep(2);

  const addKeyResult = () => {
    if (fields.length >= 5) return;
    // Default owner to current logged-in user
    const defaultOwnerId = user?.id ?? "";
    append({
      title: "",
      metricType: "number",
      startValue: 0,
      targetValue: 100,
      unit: "",
      owner: defaultOwnerId,
    });
  };

  /**
   * ==========================
   * SUBMIT
   * ==========================
   */
  const onSubmit = async (data: OKRFormData) => {
    try {
      // ---- Normalize BEFORE hitting the API ----
      // 1) Map quarter string to API format
      const { timePeriod, year } = parseQuarterString(data.timePeriod);

      // 2) Ensure department/team are VALID IDs (or null)
      const validDept = departmentsList.find((d) => d._id === data.department)?._id ?? null;
      const validTeam = teamsList.find((t) => t._id === data.team)?._id ?? null;

      // 3) Normalize KRs for boolean type (backend often expects numerics)
      const normalizedKRs = data.keyResults.map((kr) => {
        if (kr.metricType === "boolean") {
          return {
            ...kr,
            startValue: 0,
            targetValue: 1,
            unit: "",
          };
        }
        return kr;
      });

      // 4) Remove empty initiatives
      const initiatives = (data.initiatives ?? []).filter(isTruthy);

      // ---- Create objective ----
      const objective = await createObjective.mutateAsync({
        title: data.title.trim(),
        description: data.description?.trim() ?? "",
        type: data.type,
        timePeriod, // e.g. "Q4"
        year, // e.g. 2025
        departmentId: validDept ?? undefined,
        teamId: validTeam ?? undefined,
        context: data.context?.trim() ?? "",
        initiatives,
      });

      // ---- Create key results ----
      if (normalizedKRs.length) {
        await Promise.all(
          normalizedKRs.map((kr) =>
            createKeyResult.mutateAsync({
              objectiveId: objective._id,
              title: kr.title.trim(),
              metricType: kr.metricType,
              startingValue: kr.startValue,
              targetValue: kr.targetValue,
              unit: kr.unit ?? "",
              description: "",
              ownerId: user?.id, // Use current logged-in user's ID
            })
          )
        );
      }

      localStorage.removeItem("okr-draft");

      const krCount = normalizedKRs.length;
      toast({
        title: "OKR Created Successfully!",
        description: `${data.title} has been published with ${krCount} Key Result${krCount !== 1 ? "s" : ""}`,
      });

      navigate(`/okr/${objective._id}`);
    } catch (err) {
      // Extract the most useful error message
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Internal server error while creating OKR. Please check your inputs and try again.";
      toast({ variant: "destructive", title: "Failed to create OKR", description: message });
      console.error("Create OKR failed:", err);
    }
  };

  /**
   * ==========================
   * RENDERERS
   * ==========================
   */
  // Step 0: Type Selection (now first)
  const renderStep0 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">What type of objective?</h2>
        <p className="text-slate-600">Select the scope and visibility of your OKR</p>
      </div>

      {/* Help Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900 font-medium mb-1">💡 Quick Guide</p>
          <p className="text-xs text-blue-700">
            <strong>Company:</strong> Organization-wide strategic goals<br/>
            <strong>Department:</strong> Department-level objectives that align to company goals<br/>
            <strong>Team:</strong> Team-specific targets that support department priorities<br/>
            <strong>Individual:</strong> Personal goals that contribute to team success
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {/* Company Objective */}
        <Card
          aria-disabled={!isAdmin}
          className={cn(
            "cursor-pointer transition-all",
            !isAdmin && "opacity-50",
            watchType === "company" ? "ring-2 ring-blue-600 border-blue-600" : "hover:border-slate-400"
          )}
          onClick={() => {
            if (!isAdmin) return;
            setValue("type", "company", { shouldValidate: true, shouldDirty: true });
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="mt-1" style={{ pointerEvents: "none" }}>
                <input type="radio" checked={watchType === "company"} readOnly className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  <Label htmlFor="company" className="text-lg font-semibold cursor-pointer">
                    Company Objective
                  </Label>
                </div>
                <p className="text-sm text-slate-600">Align entire organization to goal</p>
                <p className="text-xs text-slate-500">→ Creates cascading team objectives</p>
                <p className="text-xs text-amber-600 font-medium">Requires: Admin role</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Objective */}
        <Card
          aria-disabled={!isManagerOrAdmin}
          className={cn(
            "cursor-pointer transition-all",
            !isManagerOrAdmin && "opacity-50",
            watchType === "department" ? "ring-2 ring-blue-600 border-blue-600" : "hover:border-slate-400"
          )}
          onClick={() => {
            if (!isManagerOrAdmin) return;
            setValue("type", "department", { shouldValidate: true, shouldDirty: true });
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="mt-1" style={{ pointerEvents: "none" }}>
                <input type="radio" checked={watchType === "department"} readOnly className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Building className="h-6 w-6 text-purple-600" />
                  <Label htmlFor="department" className="text-lg font-semibold cursor-pointer">
                    Department Objective
                  </Label>
                </div>
                <p className="text-sm text-slate-600">Set goals for your department</p>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">→ Aligns to company objectives</p>
                  <p className="text-xs text-slate-500">→ Creates cascading team objectives</p>
                </div>
                <p className="text-xs text-amber-600 font-medium">Requires: Admin or Manager role</p>
                {watchType === "department" && (
                  <div className="space-y-2">
                     <Select
                       value={watch("department") ?? undefined}
                       onValueChange={(value) => setValue("department", value)}
                     >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                         {departmentsList.length === 0 ? (
                           <SelectItem value="no-dept" disabled>No departments available</SelectItem>
                         ) : (
                           departmentsList.map((dept) => (
                             <SelectItem key={dept._id} value={dept._id}>
                               {dept.name} ({dept.code})
                             </SelectItem>
                           ))
                         )}
                      </SelectContent>
                    </Select>
                    {departmentsList.length === 0 && (
                      <p className="text-xs text-red-500">Please create departments first</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Objective */}
        <Card
          className={cn("cursor-pointer transition-all", watchType === "team" ? "ring-2 ring-blue-600 border-blue-600" : "hover:border-slate-400")}
          onClick={() => setValue("type", "team")}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <input type="radio" checked={watchType === "team"} readOnly className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  <Label htmlFor="team" className="text-lg font-semibold cursor-pointer">
                    Team Objective
                  </Label>
                </div>
                <p className="text-sm text-slate-600">Set goals for your team</p>
                <p className="text-xs text-slate-500">→ Aligns to department objectives</p>
                {watchType === "team" && (
                  <div className="space-y-2">
                    <Select
                      value={watch("team") ?? undefined}
                      onValueChange={(value) => setValue("team", value)}
                      disabled={!isAdmin && !!userTeamId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {isAdmin
                          ? teamsList.map((team) => (
                              <SelectItem key={team._id} value={team._id}>
                                {team.name}
                              </SelectItem>
                            ))
                          : userTeamId
                          ? teamsList.filter(t => t._id === userTeamId).map((team) => (
                              <SelectItem key={team._id} value={team._id}>
                                {team.name}
                              </SelectItem>
                            ))
                          : teamsList.map((team) => (
                              <SelectItem key={team._id} value={team._id}>
                                {team.name}
                              </SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                    {!isAdmin && userTeamId && (
                      <p className="text-xs text-slate-500">Your team is automatically selected</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Objective */}
        <Card
          className={cn("cursor-pointer transition-all", watchType === "individual" ? "ring-2 ring-blue-600 border-blue-600" : "hover:border-slate-400")}
          onClick={() => setValue("type", "individual")}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <input type="radio" checked={watchType === "individual"} readOnly className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 text-blue-600" />
                  <Label htmlFor="individual" className="text-lg font-semibold cursor-pointer">
                    Individual Objective
                  </Label>
                </div>
                <p className="text-sm text-slate-600">Individual contributor goals</p>
                <p className="text-xs text-slate-500">→ Links to team priorities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Step 1: Template Selection (filtered by type)
  const renderStep1 = () => (
    <TemplateSelector
      selectedType={watchType}
      onSelectTemplate={handleTemplateSelect}
      onSkip={handleSkipTemplate}
    />
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Define Objective</h2>
        <p className="text-slate-600">What do you want to achieve this quarter?</p>
      </div>

      {/* Best Practices Card */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <p className="text-sm text-amber-900 font-medium mb-1">✍️ Writing Great Objectives</p>
          <ul className="text-xs text-amber-800 space-y-1">
            <li>• Start with an action verb (Launch, Increase, Build, Establish)</li>
            <li>• Be ambitious yet achievable - objectives should inspire</li>
            <li>• Keep it clear and concise (5-15 words ideal)</li>
            <li>• Focus on outcomes, not activities</li>
          </ul>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="title">Objective Title *</Label>
            <Button type="button" variant="ghost" size="sm" onClick={() => alert("AI Assistant coming soon!")}>
              <Sparkles className="h-4 w-4 mr-1" /> AI Assist
            </Button>
          </div>
          <Input
            id="title"
            placeholder="e.g., Launch Mobile App Beta with 1000+ active users"
            {...register("title")}
          />
          {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
          <p className="text-xs text-slate-500">{watch("title")?.length || 0}/100 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            placeholder="Describe what success looks like and why this objective matters. What impact will it have?"
            rows={3}
            {...register("description")}
          />
          <p className="text-xs text-slate-500">Add context to help others understand the 'why' behind this objective</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timePeriod">Time Period *</Label>
          <Select value={watch("timePeriod")} onValueChange={(value) => setValue("timePeriod", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select quarter (e.g., Q1 2025)" />
            </SelectTrigger>
            <SelectContent>
              {TIME_PERIODS.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.timePeriod && <p className="text-sm text-red-600">{errors.timePeriod.message}</p>}
          <p className="text-xs text-slate-500">OKRs are typically set quarterly for focused execution</p>
        </div>

        {/* Parent Objective Alignment - Show based on OKR type hierarchy */}
        {(() => {
          const currentType = watchType;
          let parentObjectives: typeof objectivesList = [];

          // Define parent objectives based on type hierarchy
          if (currentType === "department") {
            // Department OKRs can align to Company OKRs
            parentObjectives = objectivesList.filter((obj) => obj.type === "company");
          } else if (currentType === "team") {
            // Team OKRs can align to Company or Department OKRs
            parentObjectives = objectivesList.filter((obj) => obj.type === "company" || obj.type === "department");
          } else if (currentType === "individual") {
            // Individual OKRs can align to any higher-level OKR
            parentObjectives = objectivesList.filter((obj) => obj.type === "company" || obj.type === "department" || obj.type === "team");
          }
          // Company OKRs have no parent (top-level)

          return parentObjectives.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="alignTo">
                Align to Parent Objective
                <span className="ml-1 text-xs font-normal text-blue-600">(recommended)</span>
              </Label>
              <Select value={watch("alignTo") ?? undefined} onValueChange={(value) => setValue("alignTo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose parent objective to align with..." />
                </SelectTrigger>
                <SelectContent>
                  {parentObjectives.map((obj) => (
                    <SelectItem key={obj._id} value={obj._id}>
                      {obj.type.charAt(0).toUpperCase() + obj.type.slice(1)}: {obj.title} ({obj.progress}% progress)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                💡 Aligning to a parent objective ensures your work contributes to higher-level goals
              </p>
            </div>
          ) : null;
        })()}

        <div className="space-y-2">
          <Label htmlFor="context">Project or Initiative Context (optional)</Label>
          <Input id="context" placeholder="e.g., Q4 Product Launch, Mobile-First Initiative" {...register("context")} />
          <p className="text-xs text-slate-500">Link this OKR to a specific project or strategic initiative</p>
        </div>

        {/* Related OKRs - Show objectives at same or different levels */}
        {objectivesList.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="relatedTo">Related OKRs (optional)</Label>
            <Select value={watch("relatedTo") ?? undefined} onValueChange={(value) => setValue("relatedTo", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Link to related OKRs..." />
              </SelectTrigger>
              <SelectContent>
                {objectivesList.map((obj) => (
                  <SelectItem key={obj._id} value={obj._id}>
                    {obj.type.charAt(0).toUpperCase() + obj.type.slice(1)}: {obj.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">Connect this OKR to related objectives for cross-team visibility</p>
          </div>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">AI Assistant</p>
                <p className="text-xs text-blue-700 mb-3">Let AI help you craft better objectives and key results</p>
                <Button type="button" variant="outline" size="sm" onClick={() => alert("AI Assistant coming soon!")} className="bg-white">
                  Generate Suggestions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Add Key Results</h2>
        <p className="text-slate-600">Define 2-5 measurable outcomes (currently: {fields.length})</p>
      </div>

      {/* Key Results Best Practices */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <p className="text-sm text-green-900 font-medium mb-1">📊 Key Results Checklist</p>
          <ul className="text-xs text-green-800 space-y-1">
            <li>• <strong>Measurable:</strong> Use numbers, percentages, or yes/no completion</li>
            <li>• <strong>Specific:</strong> "Launch iOS app" not "Work on mobile"</li>
            <li>• <strong>Achievable:</strong> Stretch goals are good, impossible ones demotivate</li>
            <li>• <strong>Time-bound:</strong> Should be achievable within the quarter</li>
            <li>• <strong>Impact-focused:</strong> Measure outcomes, not activities</li>
          </ul>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id} className="relative">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-slate-900">Key Result #{index + 1}</h4>
                {fields.length > 2 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="e.g., Launch iOS app in App Store with 4.5+ star rating"
                  {...register(`keyResults.${index}.title` as const)}
                />
                {errors.keyResults?.[index]?.title && (
                  <p className="text-sm text-red-600">{errors.keyResults?.[index]?.title?.message as string}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Metric Type</Label>
                <RadioGroup
                  value={watchKeyResults[index]?.metricType || "number"}
                  onValueChange={(value) => setValue(`keyResults.${index}.metricType` as const, value as "number" | "percentage" | "boolean")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="number" id={`num-${index}`} />
                    <Label htmlFor={`num-${index}`} className="cursor-pointer">Number</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id={`pct-${index}`} />
                    <Label htmlFor={`pct-${index}`} className="cursor-pointer">Percentage</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="boolean" id={`bool-${index}`} />
                    <Label htmlFor={`bool-${index}`} className="cursor-pointer">Yes/No</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-slate-500">
                  💡 {watchKeyResults[index]?.metricType === "percentage" ? "Great for growth metrics (e.g., Increase user retention by 25%)" :
                      watchKeyResults[index]?.metricType === "boolean" ? "Perfect for deliverables (e.g., Launch product feature)" :
                      "Good for counts and totals (e.g., Acquire 1000 new users)"}
                </p>
              </div>

              {watchKeyResults[index]?.metricType !== "boolean" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Starting Value</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        {...register(`keyResults.${index}.startValue` as const, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Value *</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        {...register(`keyResults.${index}.targetValue` as const, { valueAsNumber: true })}
                      />
                      {errors.keyResults?.[index]?.targetValue && (
                        <p className="text-sm text-red-600">{errors.keyResults?.[index]?.targetValue?.message as string}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Input placeholder="e.g., users, $, %" {...register(`keyResults.${index}.unit` as const)} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">📈 Set your baseline and target to track progress accurately</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Owner *</Label>
                <Select value={watchKeyResults[index]?.owner} onValueChange={(value) => setValue(`keyResults.${index}.owner` as const, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to team member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {usersList.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.keyResults?.[index]?.owner && (
                  <p className="text-sm text-red-600">{errors.keyResults?.[index]?.owner?.message as string}</p>
                )}
                <p className="text-xs text-slate-500">👤 Defaults to you - change if someone else will own this key result</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {fields.length < 5 && (
          <Button type="button" variant="outline" onClick={addKeyResult} className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Add Another Key Result ({fields.length}/5)
          </Button>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-700">AI can suggest key results from your objective.</p>
            <Button type="button" variant="outline" size="sm" className="mt-2 bg-white">
              <Sparkles className="h-4 w-4 mr-1" /> Generate KRs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const formData = watch();
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Review OKR</h2>
          <p className="text-slate-600">Review your objective before publishing</p>
        </div>

        {/* Review Checklist */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <p className="text-sm text-purple-900 font-medium mb-2">✅ Final Checklist</p>
            <ul className="text-xs text-purple-800 space-y-1">
              <li>• Objective is clear and inspiring</li>
              <li>• Key results are measurable and specific</li>
              <li>• Targets are ambitious but achievable</li>
              <li>• Owners are assigned to each key result</li>
              <li>• Aligned to higher-level objectives (if applicable)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Objective</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900">{formData.title || "Untitled Objective"}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-600">Type: </span>
                <span className="font-medium capitalize">{formData.type}</span>
              </div>
              {formData.team && (
                <div>
                  <span className="text-slate-600">Team: </span>
                  <span className="font-medium">
                    {teamsList.find((t) => t._id === formData.team)?.name ?? "—"}
                  </span>
                </div>
              )}
              <div>
                <span className="text-slate-600">Period: </span>
                <span className="font-medium">{TIME_PERIODS.find((p) => p.value === formData.timePeriod)?.label}</span>
              </div>
              {formData.alignTo && (
                <div>
                  <span className="text-slate-600">Aligned to: </span>
                  <span className="font-medium">Parent OKR</span>
                </div>
              )}
              {formData.context && (
                <div className="col-span-2">
                  <span className="text-slate-600">Context: </span>
                  <span className="font-medium">{formData.context}</span>
                </div>
              )}
              {formData.relatedTo && (
                <div className="col-span-2">
                  <span className="text-slate-600">Related OKRs: </span>
                  <span className="font-medium">Cross-team collaboration</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Key Results ({formData.keyResults.length})</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.keyResults.map((kr, index) => (
              <div key={index} className="p-3 bg-slate-50 rounded-lg space-y-2">
                <div className="font-medium text-slate-900">{index + 1}. {kr.title || "Untitled Key Result"}</div>
                <div className="text-sm text-slate-600">
                  {kr.metricType === "boolean" ? (
                    "Boolean: Not Started → Completed"
                  ) : (
                    <>
                      {kr.startValue} → {kr.targetValue} {kr.unit && kr.unit}
                    </>
                  )}
                </div>
                <div className="text-xs text-slate-500">Owner: {usersList.find((u) => u._id === kr.owner)?.name || kr.owner}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-amber-900 mb-2">Once published:</p>
            <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
              <li>Team members can start tracking progress</li>
              <li>Cannot change time period or metric types</li>
              <li>Can still edit titles and targets</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New OKR</h1>
          <p className="text-slate-600">Follow the steps to create a new objective and key results</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-slate-600">
              {currentStep + 1}/{STEPS.length}
            </span>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                      currentStep === step.id ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                      currentStep > step.id ? "bg-green-600 text-white" :
                      "bg-slate-200 text-slate-600"
                    )}
                  >
                    {currentStep > step.id ? "✓" : step.id + 1}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={cn(
                      "text-xs font-medium transition-colors",
                      currentStep === step.id ? "text-blue-600" : "text-slate-900"
                    )}>
                      {step.name}
                    </p>
                    <p className="text-xs text-slate-500 hidden sm:block">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "h-1 flex-1 mx-2 transition-all duration-300",
                    currentStep > step.id ? "bg-green-600" : "bg-slate-200"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardContent className="p-6 md:p-8">
              {currentStep === 0 && renderStep0()}
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </CardContent>
          </Card>

          {/* Navigation Buttons - Show on all steps */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                Cancel
              </Button>
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    try {
                      const data = watch();
                      localStorage.setItem("okr-draft", JSON.stringify(data));
                      toast({ title: "Draft saved" });
                    } catch (error) {
                      console.warn("Failed to save draft:", error);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  Save Draft
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={goBack} disabled={isSubmitting}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              )}
              {currentStep < 4 ? (
                <Button type="button" onClick={goNext} disabled={isSubmitting}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Publishing..." : "Publish OKR"}
                </Button>
              )}
            </div>
          </div>

          {/* Helpful Hints */}
          {currentStep > 0 && currentStep < 4 && (
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-500">
                💡 <strong>Tip:</strong> Your progress is automatically saved. Click "Save Draft" to save manually and come back later.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
