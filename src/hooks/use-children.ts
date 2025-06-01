"use client";

import { useState, useEffect } from "react";
import { useToast } from "./use-toast";
import { ClientCookies } from "@/helpers/cookies";
import { ApiClient } from "@/helpers/api-client";

interface Child {
  id?: string;
  name: string;
  age: number;
  grade: string;
  birthDate?: string;
}

export function useChildren() {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const loadChildren = async () => {
    setIsLoading(true);
    try {
      const response = await ApiClient.getChildren();

      if (!response.ok) throw new Error("Failed to load children");

      const data = await response.json();
      setChildren(data.children || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load children data",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const addChild = async (child: Omit<Child, "id">) => {
    setIsLoading(true);
    try {
      const response = await ApiClient.addChild(child);

      if (!response.ok) throw new Error("Failed to add child");

      const newChild = await response.json();
      setChildren((prev) => [...prev, newChild]);

      toast({
        title: "Success!",
        description: "Child profile added successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add child profile",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const updateChild = async (id: string, updatedChild: Omit<Child, "id">) => {
    setIsLoading(true);
    try {
      const response = await ApiClient.updateChild(id, updatedChild);

      if (!response.ok) throw new Error("Failed to update child");

      const updated = await response.json();
      setChildren((prev) =>
        prev.map((child) => (child.id === id ? updated : child))
      );

      toast({
        title: "Success!",
        description: "Child profile updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update child profile",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const deleteChild = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await ApiClient.deleteChild(id);

      if (!response.ok) throw new Error("Failed to delete child");

      setChildren((prev) => prev.filter((child) => child.id !== id));

      toast({
        title: "Success!",
        description: "Child profile deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete child profile",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const updateChildren = async (newChildren: Child[]) => {
    setIsLoading(true);
    try {
      const response = await ApiClient.updateChildren(newChildren);

      if (!response.ok) throw new Error("Failed to update children");

      setChildren(newChildren);

      toast({
        title: "Success!",
        description: "Children profiles updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update children profiles",
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const token = ClientCookies.getAuthToken();
    if (token) {
      loadChildren();
    }
  }, []);

  return {
    children,
    isLoading,
    addChild,
    updateChild,
    deleteChild,
    updateChildren,
    loadChildren,
  };
}
