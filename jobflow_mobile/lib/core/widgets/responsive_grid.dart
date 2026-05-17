import 'package:flutter/material.dart';

/// RESP-03: A responsive grid that reflows children based on viewport width.
/// - Mobile (< 600): 2 columns
/// - Tablet (600-1200): 3 columns
/// - Desktop (≥ 1200): 4 columns
class ResponsiveGrid extends StatelessWidget {
  final List<Widget> children;
  final double spacing;
  final double runSpacing;

  const ResponsiveGrid({
    super.key,
    required this.children,
    this.spacing = 12,
    this.runSpacing = 12,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final int crossAxisCount;

        if (width >= 1200) {
          crossAxisCount = 4;
        } else if (width >= 600) {
          crossAxisCount = 3;
        } else {
          crossAxisCount = 2;
        }

        return Wrap(
          spacing: spacing,
          runSpacing: runSpacing,
          children: children.map((child) {
            final itemWidth = (width - (spacing * (crossAxisCount - 1))) / crossAxisCount;
            return SizedBox(width: itemWidth, child: child);
          }).toList(),
        );
      },
    );
  }
}
