import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type BookFormProps = {
  action: (formData: FormData) => Promise<void>;
  initial?: { title: string; yearLevel: number; contentText: string; pdfUrl?: string | null };
};

export function BookForm({ action, initial }: BookFormProps) {
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={initial?.title}
          placeholder="Book title"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="yearLevel">Year Level</Label>
        <select
          id="yearLevel"
          name="yearLevel"
          required
          defaultValue={initial?.yearLevel ?? 1}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {[1, 2, 3, 4, 5].map((y) => (
            <option key={y} value={y}>
              Year {y}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pdfUrl">PDF URL (optional)</Label>
        <Input
          id="pdfUrl"
          name="pdfUrl"
          type="url"
          defaultValue={initial?.pdfUrl ?? ""}
          placeholder="https://… or leave blank"
        />
        <p className="text-xs text-muted-foreground">
          External link to the book PDF. Or use the Upload PDF section above to store a file.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contentText">Text Content</Label>
        <textarea
          id="contentText"
          name="contentText"
          required
          rows={12}
          defaultValue={initial?.contentText}
          placeholder="Paste the story or passage text here…"
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[200px]"
        />
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
}
