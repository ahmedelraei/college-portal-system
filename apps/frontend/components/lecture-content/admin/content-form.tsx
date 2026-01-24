"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ContentType } from "@/lib/api-types";

interface ContentFormProps {
  initialData?: {
    title: string;
    contentType: ContentType;
    externalUrl?: string;
    fileUrl?: string;
    textContent?: string;
    description?: string;
    displayOrder?: number;
  };
  onSubmit: (data: {
    title: string;
    contentType: ContentType;
    externalUrl?: string;
    fileUrl?: string;
    textContent?: string;
    description?: string;
    displayOrder?: number;
  }) => Promise<void>;
  onCancel: () => void;
  onUpload?: (file: File) => Promise<{ fileUrl: string }>;
}

export function ContentForm({
  initialData,
  onSubmit,
  onCancel,
  onUpload,
}: ContentFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [contentType, setContentType] = useState<ContentType>(
    initialData?.contentType || "video"
  );
  const [externalUrl, setExternalUrl] = useState(initialData?.externalUrl || "");
  const [fileUrl, setFileUrl] = useState(initialData?.fileUrl || "");
  const [textContent, setTextContent] = useState(initialData?.textContent || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [displayOrder, setDisplayOrder] = useState(initialData?.displayOrder || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    setIsUploading(true);
    try {
      const result = await onUpload(file);
      setFileUrl(result.fileUrl);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        contentType,
        externalUrl: externalUrl || undefined,
        fileUrl: fileUrl || undefined,
        textContent: textContent || undefined,
        description: description || undefined,
        displayOrder,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={255}
        />
      </div>

      <div>
        <Label htmlFor="contentType">Content Type</Label>
        <Select
          value={contentType}
          onValueChange={(value) => setContentType(value as ContentType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video">Video (External Link)</SelectItem>
            <SelectItem value="document">Document (Upload)</SelectItem>
            <SelectItem value="reading">Reading</SelectItem>
            <SelectItem value="assignment">Assignment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {contentType === "video" && (
        <div>
          <Label htmlFor="externalUrl">Video URL</Label>
          <Input
            id="externalUrl"
            type="url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            required
          />
        </div>
      )}

      {contentType === "document" && (
        <div>
          <Label htmlFor="fileUpload">Document File</Label>
          {fileUrl ? (
            <div className="space-y-2">
              <p className="text-sm text-green-600">File uploaded: {fileUrl}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFileUrl("")}
              >
                Change File
              </Button>
            </div>
          ) : (
            <Input
              id="fileUpload"
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          )}
          {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
        </div>
      )}

      {(contentType === "reading" || contentType === "assignment") && (
        <div>
          <Label htmlFor="textContent">
            {contentType === "reading" ? "Reading Content" : "Assignment Description"}
          </Label>
          <Textarea
            id="textContent"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            rows={6}
            required
          />
        </div>
      )}

      {contentType === "reading" && (
        <div>
          <Label htmlFor="externalUrl">External Link (optional)</Label>
          <Input
            id="externalUrl"
            type="url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://example.com/article"
          />
        </div>
      )}

      {contentType === "assignment" && (
        <div>
          <Label htmlFor="fileUpload">Attachment (optional)</Label>
          {fileUrl ? (
            <div className="space-y-2">
              <p className="text-sm text-green-600">File attached: {fileUrl}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFileUrl("")}
              >
                Remove
              </Button>
            </div>
          ) : (
            <Input
              id="fileUpload"
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          )}
        </div>
      )}

      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="displayOrder">Display Order</Label>
        <Input
          id="displayOrder"
          type="number"
          min="0"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10))}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? "Saving..." : initialData ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
