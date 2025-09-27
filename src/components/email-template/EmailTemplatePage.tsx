"use client";
import React, { useState, ChangeEvent } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { ChevronDownIcon, PlusIcon, FileIcon, DocsIcon, CheckLineIcon, PaperPlaneIcon } from "../../icons";
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from "@hello-pangea/dnd";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// Extend InputProps to match InputField.tsx and include multiple

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  fromName?: string;
  headerImage?: string;
  footer?: string;
  attachments?: File[];
  content: string;
  status: "Draft" | "Published";
  updatedAt: string;
  sections: { id: string; type: "text" | "image" | "button"; content: string }[];
}

const templatePresets = [
  {
    name: "Welcome Email",
    subject: "Welcome to Our Community!",
    content: "<h2>Welcome!</h2><p>Thank you for joining us...</p>",
    sections: [{ id: "1", type: "text" as const, content: "<h2>Welcome!</h2><p>Thank you for joining us...</p>" }],
  },
  {
    name: "Newsletter",
    subject: "Monthly Updates",
    content: "<h2>Latest News</h2><p>Here's what's new...</p>",
    sections: [{ id: "2", type: "text" as const, content: "<h2>Latest News</h2><p>Here's what's new...</p>" }],
  },
  {
    name: "Promotional Offer",
    subject: "Exclusive Offer Just for You!",
    content: "<h2>Special Deal!</h2><p>Grab this offer now...</p>",
    sections: [{ id: "3", type: "text" as const, content: "<h2>Special Deal!</h2><p>Grab this offer now...</p>" }],
  },
];

export default function EmailTemplatesPage() {
  const { isOpen, openModal, closeModal } = useModal();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [newTemplate, setNewTemplate] = useState<Partial<EmailTemplate>>({ sections: [] });
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  // Save Template
  const handleSave = (status: "Draft" | "Published") => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
      setError("Template name, subject, and content are required");
      return;
    }

    const updatedSections = newTemplate.sections || [];
    const content = updatedSections.map((section) => section.content).join("\n");

    if (editingTemplate) {
      setTemplates(
        templates.map((t) =>
          t.id === editingTemplate.id
            ? { ...t, ...newTemplate, content, status, updatedAt: new Date().toLocaleDateString() }
            : t
        )
      );
    } else {
      const newId = templates.length > 0 ? Math.max(...templates.map((t) => t.id)) + 1 : 1;
      setTemplates([
        ...templates,
        {
          id: newId,
          name: newTemplate.name!,
          subject: newTemplate.subject!,
          fromName: newTemplate.fromName || "",
          headerImage: newTemplate.headerImage || "",
          footer: newTemplate.footer || "",
          attachments: newTemplate.attachments || [],
          content,
          status,
          updatedAt: new Date().toLocaleDateString(),
          sections: updatedSections,
        },
      ]);
    }

    setNewTemplate({ sections: [] });
    setEditingTemplate(null);
    setError(null);
    closeModal();
  };

  // Edit Template
  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setNewTemplate(template);
    openModal();
  };

  // Delete Template
  const handleDelete = (id: number) => {
    setTemplates(templates.filter((t) => t.id !== id));
    setOpenDropdown(null);
  };

  // Close Modal
  const handleModalClose = () => {
    setNewTemplate({ sections: [] });
    setEditingTemplate(null);
    setError(null);
    closeModal();
    setSelectedPreset("");
  };

  // Add Section
  const addSection = (type: "text" | "image" | "button") => {
    const newSection = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      content: type === "text" ? "<p>New text section</p>" : type === "image" ? "https://via.placeholder.com/600x200" : "<button class='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'>Click Me</button>",
    };
    setNewTemplate({
      ...newTemplate,
      sections: [...(newTemplate.sections || []), newSection],
      content: [...(newTemplate.sections || []), newSection].map((s) => s.content).join("\n"),
    });
  };

  // Handle Drag and Drop
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sections = Array.from(newTemplate.sections || []);
    const [reorderedSection] = sections.splice(result.source.index, 1);
    sections.splice(result.destination.index, 0, reorderedSection);
    setNewTemplate({
      ...newTemplate,
      sections,
      content: sections.map((s) => s.content).join("\n"),
    });
  };

  // Load Preset
  const loadPreset = (presetName: string) => {
    const preset = templatePresets.find((p) => p.name === presetName);
    if (preset) {
      setNewTemplate({
        ...newTemplate,
        name: preset.name,
        subject: preset.subject,
        content: preset.content,
        sections: preset.sections,
      });
      setSelectedPreset(presetName);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-bold text-gray-800 dark:text-white">Email Template Builder</h3>
          <Button onClick={openModal} size="md" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <PlusIcon className="w-5 h-5" /> New Template
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Template Gallery */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="relative flex flex-col justify-between border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1"
            >
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{template.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Last updated: {template.updatedAt}
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">📌 {template.subject}</p>
                <div
                  className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-2 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: template.content }}
                />
                <span
                  className={`inline-block px-3 py-1 mt-3 text-xs font-medium rounded-full ${
                    template.status === "Published"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}
                >
                  {template.status}
                </span>
              </div>

              <div className="relative mt-4 flex justify-end">
                <button
                  className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setOpenDropdown(openDropdown === template.id ? null : template.id)}
                >
                  <ChevronDownIcon className="w-5 h-5" />
                </button>
                <Dropdown isOpen={openDropdown === template.id} onClose={() => setOpenDropdown(null)}>
                  <DropdownItem onClick={() => handleEdit(template)}>Edit</DropdownItem>
                  <DropdownItem onClick={() => handleDelete(template.id)}>Delete</DropdownItem>
                </Dropdown>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        <Modal isOpen={isOpen} onClose={handleModalClose} className="max-w-6xl m-4">
          <div className="relative w-full rounded-3xl bg-white dark:bg-gray-900 p-8 max-h-[90vh] overflow-y-auto">
            <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {editingTemplate ? "Edit Template" : "Create New Template"}
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Sidebar: Template Settings */}
              <div className="space-y-6">
                <div>
                  <Label>Template Name</Label>
                  <Input
                    type="text"
                    placeholder="Enter template name"
                    defaultValue={newTemplate.name || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setNewTemplate({ ...newTemplate, name: e.target.value })
                    }
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <Label>Subject</Label>
                  <Input
                    type="text"
                    placeholder="Enter email subject"
                    defaultValue={newTemplate.subject || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setNewTemplate({ ...newTemplate, subject: e.target.value })
                    }
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <Label>From Name</Label>
                  <Input
                    type="text"
                    placeholder="Your brand / company name"
                    defaultValue={newTemplate.fromName || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setNewTemplate({ ...newTemplate, fromName: e.target.value })
                    }
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <Label>Header Image (URL)</Label>
                  <Input
                    type="url"
                    placeholder="https://example.com/header.png"
                    defaultValue={newTemplate.headerImage || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setNewTemplate({ ...newTemplate, headerImage: e.target.value })
                    }
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <Label>Footer</Label>
                  <Input
                    type="text"
                    placeholder="Company address | Unsubscribe link"
                    defaultValue={newTemplate.footer || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setNewTemplate({ ...newTemplate, footer: e.target.value })
                    }
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <Label>Attachments</Label>
                  <Input
                    type="file"
                    multiple
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setNewTemplate({
                        ...newTemplate,
                        attachments: e.target.files ? Array.from(e.target.files) : [],
                      })
                    }
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <Label>Load Preset</Label>
                  <select
                    value={selectedPreset}
                    onChange={(e) => loadPreset(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                  >
                    <option value="">Select a preset</option>
                    {templatePresets.map((preset) => (
                      <option key={preset.name} value={preset.name}>
                        {preset.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Middle: Content Editor */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex gap-4 mb-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addSection("text")}
                    className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    <DocsIcon className="w-4 h-4" /> Add Text
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addSection("image")}
                    className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    <FileIcon className="w-4 h-4" /> Add Image
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addSection("button")}
                    className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    <PlusIcon className="w-4 h-4" /> Add Button
                  </Button>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="sections">
                    {(provided: DroppableProvided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        {(newTemplate.sections || []).map((section, index) => (
                          <Draggable key={section.id} draggableId={section.id} index={index}>
                            {(provided: DraggableProvided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-md transition cursor-move"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section
                                  </span>
                                  <button
                                    onClick={() => {
                                      const updatedSections = (newTemplate.sections || []).filter((s, i) => i !== index);
                                      setNewTemplate({
                                        ...newTemplate,
                                        sections: updatedSections,
                                        content: updatedSections.map((s) => s.content).join("\n"),
                                      });
                                    }}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    ✕
                                  </button>
                                </div>
                                {section.type === "text" ? (
                                  <ReactQuill
                                    theme="snow"
                                    value={section.content}
                                    onChange={(content) => {
                                      const updatedSections = [...(newTemplate.sections || [])];
                                      updatedSections[index].content = content;
                                      setNewTemplate({
                                        ...newTemplate,
                                        sections: updatedSections,
                                        content: updatedSections.map((s) => s.content).join("\n"),
                                      });
                                    }}
                                    className="h-40 bg-white dark:bg-gray-700"
                                  />
                                ) : section.type === "image" ? (
                                  <Input
                                    type="url"
                                    placeholder="Enter image URL"
                                    defaultValue={section.content}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                      const updatedSections = [...(newTemplate.sections || [])];
                                      updatedSections[index].content = e.target.value;
                                      setNewTemplate({
                                        ...newTemplate,
                                        sections: updatedSections,
                                        content: updatedSections.map((s) => s.content).join("\n"),
                                      });
                                    }}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600"
                                  />
                                ) : (
                                  <Input
                                    type="text"
                                    placeholder="Enter button text"
                                    defaultValue={section.content.replace(/<button[^>]*>|<\/button>/g, "")}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                      const updatedSections = [...(newTemplate.sections || [])];
                                      updatedSections[index].content = `<button class='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'>${e.target.value}</button>`;
                                      setNewTemplate({
                                        ...newTemplate,
                                        sections: updatedSections,
                                        content: updatedSections.map((s) => s.content).join("\n"),
                                      });
                                    }}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600"
                                  />
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                {/* Live Preview */}
                <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800 shadow-inner max-h-96 overflow-y-auto">
                  <h5 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">Live Preview</h5>
                  {newTemplate.headerImage && (
                    <Image
                      src={newTemplate.headerImage}
                      alt="Header"
                      width={600}
                      height={200}
                      className="mb-4 rounded-lg max-h-48 object-cover w-full"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {newTemplate.subject || "Your email subject here"}
                  </h2>
                  <p className="text-xs text-gray-500 mb-4">From: {newTemplate.fromName || "Your Company"}</p>

                  <div className="prose dark:prose-invert max-w-none my-4">
                    {(newTemplate.sections || []).map((section, index) => (
                      <div key={index} className="mb-4">
                        {section.type === "image" ? (
                          <Image
                            src={section.content}
                            alt="Section"
                            width={600}
                            height={200}
                            className="max-w-full h-auto rounded-lg"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div dangerouslySetInnerHTML={{ __html: section.content }} />
                        )}
                      </div>
                    ))}
                    {!newTemplate.sections?.length && (
                      <p className="text-gray-500 dark:text-gray-400">Start building your email...</p>
                    )}
                  </div>

                  {newTemplate.footer && (
                    <footer className="mt-4 border-t pt-3 text-xs text-gray-600 dark:text-gray-400">
                      {newTemplate.footer}
                    </footer>
                  )}

                  {newTemplate.attachments && newTemplate.attachments.length > 0 && (
                    <ul className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                      {newTemplate.attachments.map((file, i) => (
                        <li key={i} className="flex items-center gap-1">
                          📎 {file.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="lg:col-span-3 flex justify-end gap-4 mt-6">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleModalClose}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => handleSave("Draft")}
                  className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  <CheckLineIcon className="w-4 h-4" /> Save as Draft
                </Button>
                <Button
                  size="sm"
                  type="button"
                  onClick={() => handleSave("Published")}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PaperPlaneIcon className="w-4 h-4" /> Publish
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}