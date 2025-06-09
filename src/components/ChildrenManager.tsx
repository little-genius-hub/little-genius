"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, Plus, Edit } from "lucide-react";

interface Child {
  id?: string;
  name: string;
  age: number;
  grade: string;
  birthDate?: string;
}

interface ChildrenManagerProps {
  children: Child[];
  onUpdate: (children: Child[]) => void;
}

export default function ChildrenManager({
  children,
  onUpdate,
}: ChildrenManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newChild, setNewChild] = useState<Child>({
    name: "",
    age: 0,
    grade: "",
    birthDate: "",
  });

  const handleAddChild = () => {
    if (newChild.name && newChild.age && newChild.grade) {
      const childWithId = {
        ...newChild,
        id: Date.now().toString(),
      };
      onUpdate([...children, childWithId]);
      setNewChild({ name: "", age: 0, grade: "", birthDate: "" });
      setIsAdding(false);
    }
  };

  const handleDeleteChild = (id: string) => {
    onUpdate(children.filter((child) => child.id !== id));
  };

  const handleEditChild = (id: string) => {
    const child = children.find((c) => c.id === id);
    if (child) {
      setNewChild(child);
      setEditingId(id);
      setIsAdding(true);
    }
  };

  const handleUpdateChild = () => {
    if (editingId && newChild.name && newChild.age && newChild.grade) {
      onUpdate(
        children.map((child) =>
          child.id === editingId ? { ...newChild, id: editingId } : child
        )
      );
      setNewChild({ name: "", age: 0, grade: "", birthDate: "" });
      setEditingId(null);
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewChild({ name: "", age: 0, grade: "", birthDate: "" });
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Children Profiles
          <Button
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Child
          </Button>
        </CardTitle>
        <CardDescription>
          Manage your children's learning profiles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add/Edit Form */}
        {isAdding && (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="childName">Name</Label>
                    <Input
                      id="childName"
                      value={newChild.name}
                      onChange={(e) =>
                        setNewChild({ ...newChild, name: e.target.value })
                      }
                      placeholder="Child's name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="childAge">Age</Label>
                    <Input
                      id="childAge"
                      type="number"
                      value={newChild.age}
                      onChange={(e) =>
                        setNewChild({
                          ...newChild,
                          age: parseInt(e.target.value),
                        })
                      }
                      placeholder="Age"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="childGrade">Grade</Label>
                    <Input
                      id="childGrade"
                      value={newChild.grade}
                      onChange={(e) =>
                        setNewChild({ ...newChild, grade: e.target.value })
                      }
                      placeholder="e.g., Kindergarten, Grade 1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="childBirthDate">
                      Birth Date (Optional)
                    </Label>
                    <Input
                      id="childBirthDate"
                      type="date"
                      value={newChild.birthDate}
                      onChange={(e) =>
                        setNewChild({ ...newChild, birthDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={editingId ? handleUpdateChild : handleAddChild}
                    size="sm"
                  >
                    {editingId ? "Update" : "Add"} Child
                  </Button>
                  <Button variant="outline" onClick={handleCancel} size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Children List */}
        {children.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No children added yet.</p>
            <p className="text-sm">
              Click "Add Child" to create your first child profile.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {children.map((child) => (
              <Card key={child.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{child.name}</h4>
                    <p className="text-sm text-gray-600">
                      Age: {child.age} • Grade: {child.grade}
                      {child.birthDate && ` • Born: ${child.birthDate}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditChild(child.id!)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteChild(child.id!)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
