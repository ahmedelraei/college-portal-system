"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import { WeekForm } from "./week-form";
import { ContentForm } from "./content-form";
import { lectureContentApi } from "@/lib/api-client";
import type { Week, LectureContent } from "@/lib/api-types";
import { toast } from "sonner";

interface ContentManagerProps {
  courseId: number;
}

export function ContentManager({ courseId }: ContentManagerProps) {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [weekContents, setWeekContents] = useState<LectureContent[]>([]);
  const [isWeekDialogOpen, setIsWeekDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [editingWeek, setEditingWeek] = useState<Week | null>(null);
  const [editingContent, setEditingContent] = useState<LectureContent | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWeeks = async () => {
    try {
      const data = await lectureContentApi.getWeeks(courseId);
      setWeeks(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load weeks");
    } finally {
      setLoading(false);
    }
  };

  const loadWeekContent = async (weekId: number) => {
    try {
      const data = await lectureContentApi.getContent(weekId);
      setWeekContents(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load content");
    }
  };

  useEffect(() => {
    loadWeeks();
  }, [courseId]);

  useEffect(() => {
    if (selectedWeek) {
      loadWeekContent(selectedWeek.id);
    }
  }, [selectedWeek]);

  const handleCreateWeek = async (data: any) => {
    try {
      await lectureContentApi.createWeek(courseId, data);
      toast.success("Week created successfully");
      setIsWeekDialogOpen(false);
      loadWeeks();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create week");
      throw error;
    }
  };

  const handleUpdateWeek = async (data: any) => {
    if (!editingWeek) return;
    try {
      await lectureContentApi.updateWeek(courseId, editingWeek.id, data);
      toast.success("Week updated successfully");
      setIsWeekDialogOpen(false);
      setEditingWeek(null);
      loadWeeks();
      if (selectedWeek?.id === editingWeek.id) {
        setSelectedWeek({ ...editingWeek, ...data });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update week");
      throw error;
    }
  };

  const handleDeleteWeek = async (weekId: number) => {
    if (!confirm("Are you sure you want to delete this week? All content will be removed."))
      return;
    try {
      await lectureContentApi.deleteWeek(courseId, weekId);
      toast.success("Week deleted successfully");
      loadWeeks();
      if (selectedWeek?.id === weekId) {
        setSelectedWeek(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete week");
    }
  };

  const handleTogglePublish = async (week: Week) => {
    try {
      await lectureContentApi.updateWeek(courseId, week.id, {
        isPublished: !week.isPublished,
      });
      toast.success(week.isPublished ? "Week unpublished" : "Week published");
      loadWeeks();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to toggle publish");
    }
  };

  const handleCreateContent = async (data: any) => {
    if (!selectedWeek) return;
    try {
      await lectureContentApi.createContent(selectedWeek.id, data);
      toast.success("Content created successfully");
      setIsContentDialogOpen(false);
      loadWeekContent(selectedWeek.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create content");
      throw error;
    }
  };

  const handleUpdateContent = async (data: any) => {
    if (!editingContent) return;
    try {
      await lectureContentApi.updateContent(editingContent.id, data);
      toast.success("Content updated successfully");
      setIsContentDialogOpen(false);
      setEditingContent(null);
      if (selectedWeek) loadWeekContent(selectedWeek.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update content");
      throw error;
    }
  };

  const handleDeleteContent = async (contentId: number) => {
    if (!confirm("Are you sure you want to delete this content item?")) return;
    try {
      await lectureContentApi.deleteContent(contentId);
      toast.success("Content deleted successfully");
      if (selectedWeek) loadWeekContent(selectedWeek.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete content");
    }
  };

  const handleUploadFile = async (file: File) => {
    if (!selectedWeek) throw new Error("No week selected");
    const result = await lectureContentApi.uploadFile(file, courseId, selectedWeek.id);
    return { fileUrl: result.fileUrl };
  };

  const handleMoveContent = async (contentId: number, direction: "up" | "down") => {
    const index = weekContents.findIndex((c) => c.id === contentId);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === weekContents.length - 1) return;

    const newContents = [...weekContents];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newContents[index], newContents[swapIndex]] = [newContents[swapIndex], newContents[index]];

    try {
      await lectureContentApi.reorderContent(
        selectedWeek!.id,
        newContents.map((c, i) => ({ id: c.id, displayOrder: i }))
      );
      setWeekContents(newContents);
      toast.success("Content reordered");
    } catch (error) {
      toast.error("Failed to reorder content");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Content Management</h2>
        <Button onClick={() => setIsWeekDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Week
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weeks List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Weeks ({weeks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {weeks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No weeks created yet</p>
            ) : (
              weeks.map((week) => (
                <div
                  key={week.id}
                  className={`p-3 rounded border cursor-pointer hover:bg-muted/50 ${
                    selectedWeek?.id === week.id ? "bg-muted border-primary" : ""
                  }`}
                  onClick={() => setSelectedWeek(week)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Week {week.weekNumber}</span>
                        {week.isPublished ? (
                          <Badge variant="default" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{week.title}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePublish(week);
                        }}
                      >
                        {week.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingWeek(week);
                          setIsWeekDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWeek(week.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Content List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {selectedWeek
                  ? `Week ${selectedWeek.weekNumber} Content`
                  : "Select a week to manage content"}
              </CardTitle>
              {selectedWeek && (
                <Button onClick={() => setIsContentDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedWeek ? (
              <p className="text-sm text-muted-foreground">
                Select a week from the list to manage its content
              </p>
            ) : weekContents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No content added yet</p>
            ) : (
              weekContents.map((content, index) => (
                <div key={content.id} className="p-4 rounded border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{content.contentType}</Badge>
                        <span className="font-medium">{content.title}</span>
                      </div>
                      {content.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {content.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveContent(content.id, "up")}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveContent(content.id, "down")}
                        disabled={index === weekContents.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingContent(content);
                          setIsContentDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteContent(content.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Week Dialog */}
      <Dialog
        open={isWeekDialogOpen}
        onOpenChange={(open) => {
          setIsWeekDialogOpen(open);
          if (!open) setEditingWeek(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingWeek ? "Edit Week" : "Create Week"}</DialogTitle>
            <DialogDescription>
              {editingWeek
                ? "Update the week details"
                : "Add a new week to organize course content"}
            </DialogDescription>
          </DialogHeader>
          <WeekForm
            initialData={editingWeek || undefined}
            onSubmit={editingWeek ? handleUpdateWeek : handleCreateWeek}
            onCancel={() => {
              setIsWeekDialogOpen(false);
              setEditingWeek(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Content Dialog */}
      <Dialog
        open={isContentDialogOpen}
        onOpenChange={(open) => {
          setIsContentDialogOpen(open);
          if (!open) setEditingContent(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? "Edit Content" : "Add Content"}
            </DialogTitle>
            <DialogDescription>
              {editingContent
                ? "Update the content item"
                : "Add a new content item to this week"}
            </DialogDescription>
          </DialogHeader>
          <ContentForm
            initialData={editingContent || undefined}
            onSubmit={editingContent ? handleUpdateContent : handleCreateContent}
            onCancel={() => {
              setIsContentDialogOpen(false);
              setEditingContent(null);
            }}
            onUpload={handleUploadFile}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
